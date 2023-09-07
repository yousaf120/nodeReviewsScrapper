const express = require("express");
const signuprouter = express.Router();
const cors = require("cors");
const puppeteer = require("puppeteer"); 
signuprouter.options("/scrapping", cors());
signuprouter.post("/scrapping", async(req, res) => {
		
   (async () => {
    const req_data=req.body
    const URL = "https://www.google.com/maps/search/"+req_data.url;
    console.log(URL)
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    // Go to your site
    await page.goto(URL);
    await page.setViewport({width: 1580, height: 1424});
    await page.locator('button[data-tab-index="1"]').click();
   await page.locator('button[data-value="Sort"]').click()
   await page.locator('xpath=//div[@data-index="1"]').click()
   const maxWaitTime = 3000; // Maximum time to wait in milliseconds
   const startTime = Date.now();
  
    const data = await page.evaluate(async (maxWaitTime, startTime) => {
      const results = [];
    const collectedReviews = new Set();
      while (true) {
        const items = document.querySelectorAll(".jftiEf");
        
        items.forEach(item => {
          itemText=item.innerText.split(',')
          if (!collectedReviews.has(itemText)) {
            collectedReviews.add(itemText);
            results.push(itemText);
          }
        });
  
        // Check if the maximum wait time has been reached
        if (Date.now() - startTime >= maxWaitTime) {
          break; // Break the loop if the time limit is exceeded
        }
        
  
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
  
      return results;
    }, maxWaitTime, startTime); // Pass maxWaitTime and startTime as arguments
    const newReviews=[]
    for(let i=0;i<data.length;i++)
    {
      if (data[i][0].includes('NEW')) {
        itemText=data[i][0].split(',')
        newReviews.push(itemText)
      } 
    }
    
    

  
    await browser.close();
    res.send(newReviews)

  })();


  
  
});





module.exports = signuprouter;
