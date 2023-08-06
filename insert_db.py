from utils import databaseTool
import json
from tqdm import tqdm
import os

name = os.listdir('dataset')[0]
db = databaseTool.MrcDatabase(f"{name.split('.')[0]}.sqlite")

with open(f"dataset/{name.split('.')[0]}.json", 'r') as outfile:
    data = json.loads(outfile.read())

for dict_child in tqdm(data):
    question = dict_child["question"]
    answer = dict_child["answer"]
    
    db.insertArticle(question, answer)