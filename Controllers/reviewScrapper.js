const express = require("express");
const signuprouter = express.Router();
const cors = require("cors");
const puppeteer = require("puppeteer"); 
signuprouter.options("/scrapping", cors());
signuprouter.post("/scrapping", async(req, res) => {
   (async () => {
    const req_data=req.body
    const URL = "https://www.google.com/maps/search/"+req_data.url;
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    // Go to your site
    await page.goto(URL);
    await page.setViewport({width: 1580, height: 1424});
    await page.waitForNavigation();
    if (page.url().includes("search")) {
      const reviewsButton = await page.waitForSelector('.Nv2PK');
      await reviewsButton.click();
      
    }
    try{
    await page.locator('button[data-tab-index="1"]').click();
    }catch(error){
      await browser.close();
      res.send("There are no reviews available")
      return; 
    }
    await page.locator('button[data-value="Sort"]').click()
    await page.locator('xpath=//div[@data-index="1"]').click()
   const maxWaitTime = 3000; 
   const startTime = Date.now();
   await page.waitForTimeout(5000)
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('[aria-label="See more"]');
    buttons.forEach(button => button.click());
  })
    const data = await page.evaluate(async (maxWaitTime, startTime) => {
      const results = new Set();
      while (true) {
        const items = document.querySelectorAll(".jftiEf");
        
        items.forEach(item => {
          itemText=item.innerText
            results.add(itemText);
        });
  
        if (Date.now() - startTime >= maxWaitTime) {
          break; 
        }
        
  
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
  
      return [...results];
    }, maxWaitTime, startTime); 

    const newData = [];

    data.forEach(item => {
      const parts = item.split(',');
      newData.push(parts);
    });
    
    const newReviews=[]
    
    for(let i=0;i<newData.length;i++)
    {
      if (newData[i][0].includes('NEW')) {
        const parts=newData[i][0].split(',')
        newReviews.push(parts)
      } 
    }
    
    

  
    await browser.close();
    res.send(newReviews)

  })();


  
  
});





module.exports = signuprouter;
