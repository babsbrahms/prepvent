const hostname = process.env.HOSTNAME

const promotionMail = (promotions, promoName) => {
    let Card = '';

    promotions.forEach(event => 
       Card += `
        <div style='width: 30%; min-height:100px; background-color: white; border-radius: 10px; padding-left: 8px; box-shadow: 4px 4px 4px grey; border-width: 1px; border-style:solid; border-color: #e8ecee7c; padding-top: 7px; margin: 3px;'>
           <div style='width: 100%; text-align: center;'>         
               <img style='width: 99%; height: auto;' alt=${event.data.name} src=${event.data.poster} />  
               <div style="padding: 5px; width: 100%">
                   <div style="padding: 3px">
                       <small style='text-align: center; color: grey'>${event.data.time.startStr} </small>
                   </div>
                   <a style="font-size: 24px; font-weight: bold" href="${hostname}/e/${event.eventId}?pid=${event._id}">${event.data.name} </a>
                   <h4 style='text-align: center; color: black; margin: 0;'>${event.data.location.text}</h4>
               </div>
           </div>
       </div>
        `
    );


   return `
   <div>
   <br />
   <br /> 
   <hr />
    <h3 style="text-align: center;">${promoName}</h3>
        <div style="display: flex; flex-direction: row; justify-content: center; width: 100%; flex-wrap: wrap;">
            ${Card}
        </div>
    </div>
   ` 
}

module.exports = promotionMail;
