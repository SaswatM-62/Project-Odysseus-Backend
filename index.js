const express = require("express")
const cors = require('cors')
const axios = require('axios')
const bodyParser = require('body-parser')
const Puppeteer = require('puppeteer');
const token = process.env['TOKEN']
const port = process.env['PORT']
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors());

app.get('/', (req, res) => {
    res.send("Home")
})

app.get('/get/userimage/:username', (req, res) => {

    const username = req.params.username

    getAvatar = async (twitterUsername) => {
        const browser = await Puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.goto(`https://twitter.com/${twitterUsername}`);
        await page.waitForSelector('a[href$="/photo"] img[src]');
        const url = await page.evaluate(() => document.querySelector('a[href$="/photo"] img').src);
        await browser.close();
        console.log(`${twitterUsername}: ${url}`);
        res.json({ profileimg: url })
    };

    getAvatar(username);
})

app.get('/get/user/:username', (req, res) => {
    const username = req.params.username
    axios.get('https://api.twitter.com/2/users/by', {
        params: {
            'usernames': username
        },
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then((resp) => {
      console.log(resp.data.data[0])
      res.setHeader('Content-Type', 'application/json');
      res.json(resp.data.data[0])
    }) 
    .catch((error) => console.error(error));
})


app.get('/get/tweets/:userid', (req, res) => {
    const userId = req.params.userid
    axios.get(`https://api.twitter.com/2/users/${userId}/tweets`, {
        params: {
            'max_results': '100'
        },
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then((resp) => {
        console.log(resp.data.data)
        const tweets = []
        const result = resp.data.data

        for (let obj of result) {
            tweets.push(obj.text)
        }

        res.setHeader('Content-Type', 'application/json');
        res.json({ tweets: tweets })
    }
    ).catch((error) => console.error(error));
})

app.listen(port, () => {
    console.log("Server running on port 4000")
})
