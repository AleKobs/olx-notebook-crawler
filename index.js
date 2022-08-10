import puppeteer from "puppeteer";
import  TelegramBot from 'node-telegram-bot-api';
import fs from 'fs/promises';
const myArray = []

async function getDatabaseData() {
    const urls_data = await fs.readFile('urls.txt', { encoding: 'utf8' });
    const JSON_data = JSON.parse(urls_data);
    return JSON_data;
}
const delay = ms => new Promise(res => setTimeout(res, ms));
async function sendTelegramNotebookMessage(msg) {
    const token = '5554918701:AAF0soyElPIDg6FRnEVjbXAc9awE21cHuXw';
    const bot = new TelegramBot(token, {polling: false});
    await bot.sendMessage('-669513119', msg);
}

async function getDataInfo(page) { 
    const _return = await page.evaluate(()=>{
        const returnData = [];
        for(var i = 1; i < 10; i++) {
            if (!document.querySelector("#ad-list > li:nth-child("+i+") > div > a")) { continue; }
            let lastPostedUrl =   document.querySelector("#ad-list > li:nth-child("+i+") > div > a").href ?? null;
            if (!lastPostedUrl) { continue; }
            let lastPostedTitle = document.querySelector("#ad-list > li:nth-child("+i+") > div > a").title ?? null;
            let lastPostedPrice = document.querySelector("#ad-list > li:nth-child("+i+") > div > a > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div > div > div:nth-child(1) > span").textContent ?? null
            returnData.push({
                url: lastPostedUrl,
                title: lastPostedTitle,
                price: lastPostedPrice,
            });
        }   
        return returnData;
    })
    return _return;
}

async function start() {
    console.log('running');
    const browser = await puppeteer.launch({
        headless:true
    });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (!["document", 'xhr', 'fetch'].includes(req.resourceType())) {
          return req.abort();
        }
        req.continue();
      });
    await page.goto('https://pb.olx.com.br/paraiba/joao-pessoa?q=notebook', {waitUntil: 'networkidle0', timeout: 0});
    
    const parsedData = await getDataInfo(page);
    const databaseData = await getDatabaseData();  
    const toParseData = [];
    parsedData.map(async (i) => {
        if (!databaseData.includes(i.url)) {
            console.log('item novo', i)
            const msg = `*Novo Notebook Cadastrado*: ${i.price} \r\n ${i.title} \r\n ${i.url}`;
            sendTelegramNotebookMessage(msg);
            databaseData.push(i.url);
            await delay(1000);
        }
    })


    
    await fs.writeFile("urls.txt", JSON.stringify(databaseData));
    console.log('escrito');
    await browser.close();
    setTimeout(() => {
        start();
    }, 5000);
}
start();