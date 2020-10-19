# -*- coding: utf-8 -*-
"""
Created on Tue Jul  2 19:58:30 2019

@author: Nidhi
"""

'''import urllib.request,json
with urllib.request.urlopen("https://api.apify.com/v2/actor-tasks/xNooTtzfF8wA9hziq/runs/last/dataset/items?token=2Z5avMBNgZaz9hgEdF7bzdpKL&ui=1&clean=1") as url :
    data = json.loads(url.read().decode())
    #print(data)
'''

'''
import requests
link_address = "https://nam03.safelinks.protection.outlook.com/?url=https%3A%2F%2Fapi.apify.com%2Fv2%2Factor-tasks%2FxNooTtzfF8wA9hziq%2Fruns%2Flast%2Fdataset%2Fitems%3Ftoken%3D2Z5avMBNgZaz9hgEdF7bzdpKL%26ui%3D1%26clean%3D1&data=02%7C01%7CNidhi.singh%40aurigo.com%7Cd86e7e92ffd74bcf8d2d08d6fab861ae%7C1cb57d256f254e2a9e2d895176ed40c6%7C0%7C0%7C636972067148322115&sdata=w8HcBHA5scgyhVr4gNMz%2FGj%2BowNBd4yiosUSX5vok1Q%3D&reserved=0"
f = requests.get(link_address)
print(f.text)
import json

data = json.loads(f.text.lstrip('[').rstrip(']'))   
'''

'''
Intervals
[ -1, -0.5) : 1, V.Negative
[-0.5, 0) : 2, Negative
[0] : 3, Neutral
(0, 0.5) : 4, Positive
[0.5, 1] : 5, V.Positive
'''

import nltk
nltk.download('vader_lexicon')
import json
from nltk.sentiment.vader import SentimentIntensityAnalyzer
def sentiment_value(paragraph):
    analyser = SentimentIntensityAnalyzer()
    result = analyser.polarity_scores(paragraph)
    score = result['compound']
    return round(score,1)

def run(jsonsample):
    print("JSON Sample IN")
    print(jsonsample)
    data = (jsonsample)
    print("Data IN")
    print(data)

    for dataComments in data:
       for review in dataComments["comments"] :
            # do a sentiments analysis on review['text']
            sscore = sentiment_value("".join(review['text']))
            sgroup = ""
            if sscore == 0:
                sgroup = "NEUTRAL"
            elif sscore < -0.5:
                sgroup = "VERYBAD"
            elif sscore >= -0.5 and sscore < 0:
                sgroup = "BAD"
            elif sscore > 0 and sscore <= 0.5:
                sgroup = "GOOD"
            elif sscore > 0.5 and sscore <= 1:
                sgroup = "VERYGOOD"

            review["SentimentScore"] = sscore
            review["SentimentGroup"] = sgroup
            #print(review) 

    return data
   

if __name__ == "__main__":
    main()






#print(data)

#statement= "My Agency is involved in the construction of a number of projects for the State of Utah Masterworks provides a platform whereby many points of information, data, etc. pertaining to these projects are available within a click or two of my mouse.My main interaction with Masterworks is the filling out of work progress forms; in the beginning, there were a few very frustrating shortcomings in the form process; after contacts with your IT department, most have been corrected; the chief of these was how easy it was to lose data that you had just entered in the forms; a current nuisance [that I'm sure has always existed] is there is no auto save"
#sentiment_value(statement)
