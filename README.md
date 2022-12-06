# BackEndDeploy
[<img src="https://cdn.gomix.com/2bdfb3f8-05ef-4035-a06e-2043962a3a13%2Fremix-button.svg" width="163px" />](https://glitch.com/edit/#!/import/github/1comce/BackEndDeploy)

in case of error:  
1/Textencoder error(mongoose):  
add "engines": {
    "node": "16.x"
  }  
to package.json  
2/encrypt library error (bcrypt, argon, argon2...)  
do npm rebuild <yours encrypt library> --build-from-source  
example: npm rebuild bcrypt --build-from-source
