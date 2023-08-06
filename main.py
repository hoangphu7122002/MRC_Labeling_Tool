import datetime
import json
from flask import Flask, render_template, request, jsonify
from utils import MrcDatabase
import os

name = os.listdir('dataset')[0]
name_db = name.split('.')[0] + '.sqlite'

app = Flask(__name__)
db = MrcDatabase(name_db)
idx = None

max_idx = db.getMaxArticleNumber()
print(max_idx)

@app.route('/submit', methods=['POST'])
def get_article_pg():
    global idx
    idx = int(request.form.get("page_id"))
    article = db.getArticleById(idx)
    # articleId, article, idx = db.getRandomArticle()
    questionId = db.getQuestionById(idx)
    return jsonify({'article_id': idx, 'article': article, 'question' : questionId, 'maxArticle' : max_idx ,'timestamp': datetime.datetime.now().replace(tzinfo=datetime.timezone(datetime.timedelta(hours=8))).isoformat()})

@app.route('/next', methods=['GET'])
def get_article_next():
    global idx
    if idx is None:
        idx = 1
    else:
        idx = idx + 1
        if idx > max_idx: idx = 1
    article = db.getArticleById(idx)
    # articleId, article, idx = db.getRandomArticle()
    questionId = db.getQuestionById(idx)
    return jsonify({'article_id': idx, 'article': article, 'question' : questionId, 'maxArticle' : max_idx ,'timestamp': datetime.datetime.now().replace(tzinfo=datetime.timezone(datetime.timedelta(hours=8))).isoformat()})

@app.route('/prev', methods=['GET'])
def get_article_prev():
    global idx
    if idx is None:
        idx = 1
    else:
        idx = idx - 1
        if idx == 0: idx = max_idx
    article = db.getArticleById(idx)
    # articleId, article, idx = db.getRandomArticle()
    questionId = db.getQuestionById(idx)
    return jsonify({'article_id': idx, 'article': article, 'question' : questionId ,'timestamp': datetime.datetime.now().replace(tzinfo=datetime.timezone(datetime.timedelta(hours=8))).isoformat()})



@app.route("/article", methods=["POST"])
def insert_article():
    article = request.form.get("article")
    description = request.form.get("description")

    if article: # only check field of article
        db.insertArticle(description,article)
        return {"status": "success", "message": "Article inserted successfully."}, 200

    return {"status": "error", "message": "Article or description is missing."}, 400
 
@app.route('/question-answer', methods=['POST'])
def insert_question_and_answer():
    questionAnswers = request.get_json()
    for questionAnswer in questionAnswers:
        articleId = questionAnswer.get('article_id')
        question  = questionAnswer.get('question')
        ansStart  = questionAnswer.get('answer_start')
        ansString = questionAnswer.get('answer_string')
        if articleId is  None or question is None or ansStart is None:
            continue
        else:
            db.insertQuestionAnswer(articleId, question, ansStart, ansString)
    return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}


@app.route('/', methods=['POST', 'GET'])
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8787, debug=True)