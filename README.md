# WeFarm
WeFarm is a communal gardening app to help residents in overpopulated cities combat food insecurity by providing plots of land where users can share gardening spaces with other community members to grow fruits and vegetables.
### Get Started
1. Create an account and look for nearby gardens to reserve a plot you want to garden at.
2. Utilize the in app plantepedia for tips on what vegetables are in season and tips on how to grow them.
3. Create a post to the community social feed by adding a photo and a description.
4. Look through the community feeds to see what other people are growing and their experience in the community!
5. Interact with other users online by liking their posts and posting a comment on their post!
<br><br>
## What we used
<br>
ejs | Jquery | Bootstrap | MongoDB | Express | Multer | Bcrypt | Joi | Google Maps Api 
<br><br>

## How to download and run WeFarm
1. Clone the WeFarm repository
2. Open the files on your desired text editor
3. Run `npm i` to install the dependancies
4. Sign into MongoDB to be added to the project
5. Get the required `.env` file to run the app
6. https://trello.com/b/CQX2Wgft/2800-202410-bby04
<br><br>

## How we used AI
### To create our app
We used Chat GPT to get help with formatting and code syntax. As well as helping with bug fixing and logical errors.
### To create data sets / clean data sets
We used Chat GPT to create data sets when we needed to create an array with nested fields. such as having an array `gardens` where each garden has a `plot` field, and that feild contains several values.<br>
As well as creating structured data entries based on our predefined structure.
### Within the app
We did not include AI as a feature of our app.
### *Limitations with AI*
<br><br>

## Contact
**Neriyel Reyes** - neriyel.reyes@gmail.com <br><br>
**Yujin Jeong** - te0209494@gmail.com <br><br>
**Jayden Hutchinson** - jaydenhutchinson747@gmail.com <br><br>
**Tommy Phuong** - tommyphuong64@gmail.com <br><br>
**Evan Vink** - evanvink05@hotmail.com <br><br>

## FileTree
```
WeFarn
│   .env
│   .gitignore
│   about.html
│   databaseConnection.js
│   index.js
│   package-lock.json
│   package.json
│   README.md
│   utils.js
│
├───.vscode
│       settings.json
│
├───assets
│   ├───font
│   │
│   └───img
│
├───Logo
│       WeFarm-WhiteBg.png
│       WeFarm.png
│       WeFarm.svg
│
├───modules
│       customizations.js
│       navigations.js
│
└───views
    │   template.ejs
    │   universal.css
    │   universal.js
    │
    ├───community
    │       community.css
    │       community.ejs
    │       community.js
    │
    ├───explore
    │       explore.css
    │       explore.ejs
    │       explore.js
    │
    ├───garden
    │       garden.css
    │       garden.ejs
    │       garden.js
    │       garden.json
    │
    ├───home
    │       home.css
    │       home.ejs
    │       home.js
    │
    ├───landing
    │       landing.css
    │       landing.ejs
    │       landing.js
    │
    ├───login
    │       login.css
    │       login.ejs
    │       login.js
    │       resetPassword.ejs
    │
    ├───newPost
    │       newPost.css
    │       newPost.ejs
    │       newPost.js
    │
    ├───plantepedia
    │   │   plantepedia.css
    │   │
    │   ├───plantDetail
    │   │       plantInfo.ejs
    │   │
    │   └───summary
    │           plantepediaAllPlants.ejs
    │
    ├───profile
    │       profile.css
    │       profile.ejs
    │       profile.js
    │
    ├───reservation
    │       afterSubmit.ejs
    │       plots.ejs
    │       reservation.css
    │       reserveForm.css
    │       reserveForm.ejs
    │       reserveForm.js
    │
    ├───settings
    │       settings.css
    │       settings.ejs
    │       settings.js
    │
    ├───signup
    │       signup.css
    │       signup.ejs
    │       signup.js
    │
    └───templates
            bottom-navbar.ejs
            footer.ejs
            hamburger.ejs
            header.ejs
            top-navbar.ejs
```

## Credits & References
- ChatGPT
- Stack Overflow
- Adobe Stock Photos
