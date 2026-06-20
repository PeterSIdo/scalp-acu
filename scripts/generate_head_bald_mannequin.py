import bpy
import bmesh
import os
from mathutils import Vector

# -------------------------------------------------
# Realistic bald mannequin head generation script
# -------------------------------------------------

# Clean scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Utility: smooth shade and autosmooth
def smooth_object(obj, auto_smooth_angle=1.0472):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.shade_smooth()
    if hasattr(obj.data, "use_auto_smooth"):
        obj.data.use_auto_smooth = True
        obj.data.auto_smooth_angle = auto_smooth_angle

# Utility: apply proportional deformation by vertex condition
def deform_vertices(obj, fn):
    me = obj.data
    for v in me.vertices:
        fn(v)
    me.update()

# 1) Base cranium (better starting topology than low-segment sphere)
bpy.ops.mesh.primitive_uv_sphere_add(
    segments=96,
    ring_count=64,
    radius=0.11,
    location=(0, 0, 0.18)
)
head = bpy.context.active_object
head.name = "HeadBase"

# Head proportions
head.scale = (0.82, 1.00, 1.12)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

# 2) Add neck
bpy.ops.mesh.primitive_cylinder_add(
    vertices=56,
    radius=0.052,
    depth=0.14,
    location=(0, -0.01, 0.03)
)
neck = bpy.context.active_object
neck.name = "Neck"

# 3) Add shoulders / upper bust
bpy.ops.mesh.primitive_uv_sphere_add(
    segments=64,
    ring_count=32,
    radius=0.185,
    location=(0, -0.02, -0.08)
)
shoulders = bpy.context.active_object
shoulders.name = "Shoulders"
shoulders.scale = (1.02, 0.80, 0.40)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

# 4) Join components
bpy.ops.object.select_all(action='DESELECT')
for obj in (head, neck, shoulders):
    obj.select_set(True)
bpy.context.view_layer.objects.active = head
bpy.ops.object.join()
model = bpy.context.active_object
model.name = "HeadBaldMannequin"

# 5) Sculpt-like vertex shaping to create facial structure
# Coordinate assumptions: +Y front, +Z up
def shape_face(v):
    x, y, z = v.co.x, v.co.y, v.co.z

    # overall front-face flatten + cranium retention
    if y > 0.03 and z > 0.08:
        v.co.y *= 0.90

    # forehead slope
    if z > 0.24 and y > 0.00:
        v.co.y *= 0.94

    # temporal narrowing near sides
    if z > 0.12 and z < 0.27 and abs(x) > 0.065:
        v.co.x *= 0.96

    # eye socket indentation region
    if 0.14 < z < 0.205 and abs(x) > 0.025 and abs(x) < 0.065 and y > 0.02:
        v.co.y -= 0.010

    # brow ridge slight protrusion
    if 0.20 < z < 0.225 and abs(x) < 0.075 and y > 0.01:
        v.co.y += 0.005

    # nose bridge central protrusion
    if 0.15 < z < 0.23 and abs(x) < 0.018:
        v.co.y += 0.016

    # nose tip
    if 0.125 < z < 0.155 and abs(x) < 0.015:
        v.co.y += 0.012

    # philtrum / upper-lip form
    if 0.105 < z < 0.126 and abs(x) < 0.030 and y > 0.01:
        v.co.y += 0.004

    # lips bulge (subtle mannequin realism)
    if 0.085 < z < 0.115 and abs(x) < 0.040 and y > 0.00:
        v.co.y += 0.006

    # mouth corners slight recess
    if 0.085 < z < 0.115 and abs(x) > 0.038 and abs(x) < 0.060 and y > 0.00:
        v.co.y -= 0.005

    # chin projection
    if 0.045 < z < 0.085 and abs(x) < 0.036:
        v.co.y += 0.010

    # jawline narrowing towards chin
    if 0.02 < z < 0.11 and abs(x) > 0.040:
        v.co.x *= 0.94

    # cheekbone slight volume
    if 0.12 < z < 0.18 and abs(x) > 0.045 and abs(x) < 0.085:
        v.co.y += 0.005

    # occipital back-head fullness
    if y < -0.03 and z > 0.13:
        v.co.y *= 1.05

    # neck taper
    if z < 0.12 and abs(x) < 0.07:
        v.co.x *= 0.95

deform_vertices(model, shape_face)

# 6) Add ears (simple but anatomically placed)
for side in (-1, 1):
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=24,
        ring_count=16,
        radius=0.018,
        location=(side * 0.085, 0.005, 0.155)
    )
    ear = bpy.context.active_object
    ear.scale = (0.60, 0.35, 1.00)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    ear.name = f"Ear_{'L' if side < 0 else 'R'}"

# Join ears
bpy.ops.object.select_all(action='DESELECT')
model.select_set(True)
for obj in list(bpy.data.objects):
    if obj.name.startswith("Ear_"):
        obj.select_set(True)
bpy.context.view_layer.objects.active = model
bpy.ops.object.join()
model = bpy.context.active_object
model.name = "HeadBaldMannequin"

# 7) Cleanup topology with remesh + subdiv (target medium-poly)
remesh = model.modifiers.new(name="Remesh", type='REMESH')
remesh.mode = 'SMOOTH'
remesh.octree_depth = 7
remesh.scale = 0.92
remesh.use_remove_disconnected = False
bpy.ops.object.modifier_apply(modifier=remesh.name)

subd = model.modifiers.new(name="Subd", type='SUBSURF')
subd.levels = 1
subd.render_levels = 1
bpy.ops.object.modifier_apply(modifier=subd.name)

# Keep triangulated mesh for predictable runtime
tri = model.modifiers.new(name="Triangulate", type='TRIANGULATE')
bpy.ops.object.modifier_apply(modifier=tri.name)

# Recompute normals
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.normals_make_consistent(inside=False)
bpy.ops.object.mode_set(mode='OBJECT')

# 8) Mannequin material (neutral gray)
mat = bpy.data.materials.new("MannequinMaterial")
mat.use_nodes = True
nodes = mat.node_tree.nodes
links = mat.node_tree.links
for n in list(nodes):
    if n.type != 'OUTPUT_MATERIAL':
        nodes.remove(n)

out = next(n for n in nodes if n.type == 'OUTPUT_MATERIAL')
bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
bsdf.location = (-220, 0)
bsdf.inputs["Base Color"].default_value = (0.77, 0.77, 0.77, 1.0)
bsdf.inputs["Roughness"].default_value = 0.42
bsdf.inputs["Specular IOR Level"].default_value = 0.23
links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

model.data.materials.clear()
model.data.materials.append(mat)

smooth_object(model)

# Transform for easy import framing
model.location = (0, 0, 0)
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')

# Ensure only model selected for export
bpy.ops.object.select_all(action='DESELECT')
model.select_set(True)
bpy.context.view_layer.objects.active = model

# Paths
project_glb = os.path.abspath(os.path.join(os.getcwd(), "scalp-app", "public", "models", "head_bald_mannequin.glb"))
desktop_glb = r"C:\Users\sidop\OneDrive\Desktop\head_bald_mannequin.glb"
os.makedirs(os.path.dirname(project_glb), exist_ok=True)
os.makedirs(os.path.dirname(desktop_glb), exist_ok=True)

def export_glb(path):
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_texcoords=True,
        export_normals=True,
        export_materials='EXPORT',
        export_yup=True
    )

# Export both
export_glb(project_glb)
export_glb(desktop_glb)

# Triangle count
triangles = sum((len(p.vertices) - 2) for p in model.data.polygons if len(p.vertices) >= 3)

print(f"Exported project GLB: {project_glb}")
print(f"Exported desktop GLB: {desktop_glb}")
print(f"Triangles (approx): {triangles}")
