"""燕赵遗韵交互原型。运行：pip install -r requirements.txt && python app.py"""
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

IDIOMS = {
    "黄粱一梦": {"place": "黄粱梦吕仙祠", "person": "卢生、吕翁", "source": "《枕中记》", "meaning": "比喻虚幻的梦想，或荣华富贵转眼成空。", "story": True},
    "胡服骑射": {"place": "赵王城遗址", "person": "赵武灵王", "source": "《史记·赵世家》", "meaning": "学习他人的长处，勇于改革创新。", "story": True},
    "邯郸学步": {"place": "学步桥", "person": "燕国少年", "source": "《庄子·秋水》", "meaning": "盲目模仿别人，反而失去自己原有的本领。", "story": False},
    "完璧归赵": {"place": "赵王城遗址", "person": "蔺相如", "source": "《史记·廉颇蔺相如列传》", "meaning": "把原物完好无损地归还原主。", "story": False},
    "负荆请罪": {"place": "赵王城遗址", "person": "廉颇、蔺相如", "source": "《史记·廉颇蔺相如列传》", "meaning": "主动承认错误并请求责罚。", "story": False},
    "毛遂自荐": {"place": "赵王城遗址", "person": "毛遂", "source": "《史记·平原君虞卿列传》", "meaning": "主动推荐自己承担任务。", "story": False},
    "纸上谈兵": {"place": "赵王城遗址", "person": "赵括", "source": "《史记·廉颇蔺相如列传》", "meaning": "空谈理论，不能解决实际问题。", "story": False},
    "渑池之会": {"place": "赵王城遗址", "person": "蔺相如、赵惠文王", "source": "《史记·廉颇蔺相如列传》", "meaning": "赵秦两国会盟中维护国家尊严的故事。", "story": False},
}


@app.get("/")
def index():
    return render_template("index.html", idioms=IDIOMS)


@app.get("/api/idioms")
def idioms():
    return jsonify(IDIOMS)


@app.post("/api/ask")
def ask():
    question = str((request.get_json(silent=True) or {}).get("question", "")).strip()[:300]
    if not question:
        return jsonify({"error": "请输入问题"}), 400
    matches = [name for name in IDIOMS if name in question]
    name = matches[0] if matches else ("胡服骑射" if "赵武灵王" in question else "黄粱一梦")
    item = IDIOMS[name]
    answer = f"{name}与邯郸文化有关。{item['meaning']}相关人物有{item['person']}，关联地点是{item['place']}。"
    if name == "胡服骑射":
        answer = "胡服骑射发生在战国时期的赵国。赵武灵王推行服饰与军事训练改革，学习骑射以增强军队战斗力。这里的关键是因应现实、主动学习与改革。"
    return jsonify({"answer": answer, "topic": name, "sources": [item["source"], "邯郸地方文化资料（原型示例）"], "demo": True})


@app.post("/api/recognize")
def recognize():
    # 原型仅按用户选择的示例场景返回结果；不声称已完成图像模型识别。
    scene = str(request.form.get("scene", "响堂山石窟"))
    if scene not in ("响堂山石窟", "赵王城遗址", "邯郸古城"):
        scene = "响堂山石窟"
    return jsonify({"name": scene, "confidence": None, "demo": True, "description": "这是原型示例结果。正式版需接入图像识别模型，并结合知识库校验。"})


@app.post("/api/study")
def study():
    data = request.get_json(silent=True) or {}
    age = str(data.get("age", "初中"))[:20]
    days = str(data.get("days", "3"))[:2]
    return jsonify({"title": f"邯郸{days}日成语研学路线", "subtitle": f"适合{age} · 历史溯源 · 文化体验", "stops": ["赵王城遗址：认识赵国历史", "学步桥：探究邯郸学步", "黄粱梦吕仙祠：解读黄粱一梦", "响堂山石窟：观察文化遗产"], "demo": True})


if __name__ == "__main__":
    app.run(debug=True)
