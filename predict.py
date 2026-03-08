import sys
import json
from ultralytics import YOLO
import os

def predict_fruit(image_path, model_path):
    try:
        # Load the model
        model = YOLO(model_path)
        
        # Run inference
        results = model(image_path)
        
        best_conf = 0.0
        best_class = "Unknown"
        
        # Parse the results
        for r in results:
            boxes = r.boxes
            for box in boxes:
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                if conf > best_conf:
                    best_conf = conf
                    best_class = model.names[cls]
                    
        if best_conf == 0.0:
            best_class = "No Fruit Detected"
            
        print(json.dumps({
            "success": True,
            "fruitName": best_class,
            "confidence": best_conf
        }))
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"success": False, "error": "Missing image or model path"}))
        sys.exit(1)
        
    img_path = sys.argv[1]
    mod_path = sys.argv[2]
    
    # Needs to suppress ultralytics print outputs to stdout so we only get JSON
    # It usually prints to stdout/stderr. We can redirect stdout briefly if needed, 
    # but ultralytics prints can be silenced with verbose=False in model()
    # Let's adjust inference to verbose=False
    try:
        model = YOLO(mod_path)
        results = model(img_path, verbose=False)
        best_conf = 0.0
        best_class = "Unknown"
        for r in results:
            boxes = r.boxes
            for box in boxes:
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                if conf > best_conf:
                    best_conf = conf
                    best_class = model.names[cls]
        if best_conf == 0.0:
            best_class = "No Fruit Detected"
        print(json.dumps({
            "success": True,
            "fruitName": best_class,
            "confidence": best_conf
        }))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
