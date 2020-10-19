from flask import Flask, abort, jsonify
from flask import request
from TrySA import run
from flask_cors import cross_origin

app = Flask(__name__)

@app.route('/processsentimentanalysis', methods=['POST', 'OPTIONS'])
@cross_origin()
def create_task():
    print("HV")
    print(request.json)
    data = run(request.json)
    return jsonify(data), 201

if __name__ == '__main__':
    app.run()
