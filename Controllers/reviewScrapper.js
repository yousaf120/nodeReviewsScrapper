const express = require("express");
const signuprouter = express.Router();
const cors = require("cors");
const puppeteer = require("puppeteer"); 
const { sub, format } = require('date-fns');
signuprouter.options("/scrapping", cors());
signuprouter.post("/scrapping", async(req, res) => {
   (async () => {
    const req_data=req.body
    const URL = "https://www.google.com/maps/search/"+req_data.q;
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

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
        const dataIds = Array.from(items, element => element.getAttribute('data-review-id'));
        const ratings = document.querySelectorAll(".kvMYJc");
        const ratings_count = Array.from(ratings, element => element.getAttribute('aria-label'));

        const itemTexts = Array.from(items, element => element.innerText);    
        
        items.forEach((item,index) => {
          dataId = dataIds[index]
          itemText=itemTexts[index]
          rating=ratings_count[index]
            results.add({itemText,dataId,rating});
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
      const parts = item.itemText.split(',');
      const data_id=item.dataId
      const ratings=item.rating
      newData.push({parts,data_id,ratings});
    });
    
    const newReviews=[]
    
    for(let i=0;i<newData.length;i++)
    {
      if (newData[i].parts[0].includes('NEW')) {
        const parts=newData[i].parts[0].split(',')
        let chunks=parts[0].split('\n')
        let extractedText;
        if (chunks.some(part => part.includes('review') || part.includes('reviews'))) {
          extractedText = chunks[2];
        } else {
          extractedText = chunks[1];
        }
        const currentDate = new Date();
        const calculatedDate = sub(currentDate, { days: parseInt(extractedText) });
        if(calculatedDate<req.body.date)
        {
          continue
        }
        else{
          const inputDate = new Date(calculatedDate);

          const adjustedDate = new Date(inputDate.getTime() - inputDate.getTimezoneOffset() * 60000);

          const formattedDate = adjustedDate.toISOString().replace('T', ' ').replace('Z', '');

          newReviews.push({id:newData[i].data_id,author:chunks[0],rating:parseInt(newData[i].ratings.split(' ')[0]),datetime:formattedDate,content:chunks[4]!=''?chunks[4]:'' })
        }
      } 
    }
    
    

  
    await browser.close();
    res.send(newReviews)

  })();


  
  
});





module.exports = signuprouter;
