import os
import shutil
import subprocess

lambdas = [
    "takePictureLauncher$1",
    "1$1$4$1$1",
    "1$1$4$1$2$1",
    "1$1$4$1$3",
    "1$1$4$1$4",
    "1$1$4$1$5"
]

with open("c:\\movil\\VidaSimple\\scratch\\disasm_launchers.txt", "w", encoding="utf-16") as f_out:
    for l in lambdas:
        src = f"c:\\movil\\VidaSimple\\app\\build\\tmp\\kotlin-classes\\debug\\com\\vidasimple\\ui\\home\\AICoachBottomSheetKt$AICoachBottomSheet${l}.class"
        dst = f"c:\\movil\\VidaSimple\\Test.class"
        if os.path.exists(src):
            shutil.copyfile(src, dst)
            out = subprocess.check_output(["javap", "-p", "-c", dst]).decode("utf-8", errors="ignore")
            f_out.write(f"=== {l} ===\n")
            f_out.write(out)
            f_out.write("\n\n")
            os.remove(dst)
        else:
            f_out.write(f"=== {l} ===\nFile not found: {src}\n\n")
print("Done disassembling launchers.")
