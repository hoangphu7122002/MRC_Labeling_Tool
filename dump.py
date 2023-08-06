import sqlite3
import pandas as pd
import os

name = os.listdir('dataset')[0]
name_db = name.split('.')[0] + '.sqlite'

def to_csv():
    db = sqlite3.connect(name_db)
    cursor = db.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    for table_name in tables:
        table_name = table_name[0]
        table = pd.read_sql_query("SELECT * from %s" % table_name, db)
        table.to_csv('data_dump/' + table_name + '.csv',index=False)
    cursor.close()
    db.close()

to_csv()