import React from 'react'
import { Divider} from 'semantic-ui-react';

import { EventUpdateTable } from '../Table/EventUpdateTable';
import { FeaturedEventTable } from '../Table/FeaturedEventTable';
import { MailingListTable } from '../Table/MailingListTable';
import { SocialTable } from '../Table/SocialTable';


const PromotionDetails = ({ currency, promotion, time }) => {
    
    return (
        <div>
            
            {(promotion.type === 'event update') && (<EventUpdateTable 
                details={promotion.details} 
                analytics={promotion.analytics}
                currency={currency} 
                // editPromo={(index) => this.editPromo(index)} 
                // deletePromo={(index) => this.deletePromo(index)} 
                totalCost={promotion.cost}
                view
            />)}

        
            {(promotion.type === 'featured event') && (<FeaturedEventTable
                details={promotion.details} 
                analytics={promotion.analytics}
                currency={currency} 
                // editPromo={(index) => this.editPromo(index)} 
                // deletePromo={(index) => this.deletePromo(index)} 
                totalCost={promotion.cost}
                time={time}
                view
            />)}

            {(promotion.type === 'mailing list') && (<MailingListTable
                details={promotion.details} 
                analytics={promotion.analytics}
                currency={currency} 
                // gotFollowers={gettingFollowers} 
                // approve={this.getStateFollower}
                totalCost={promotion.cost}
                view
            />)}

            
            {(promotion.type === 'social') && (<SocialTable 
                details={promotion.details} 
                analytics={promotion.analytics}
                currency={currency} 
                // gotFollowers={gettingFollowers} 
                // approve={this.getStateFollower}
                // editPromo={(index) => this.editPromo(index)} 
                // deletePromo={(index) => this.deletePromo(index)} 
                totalCost={promotion.cost}
                view
            />)}

            <Divider />
        </div>
    )
}

export default PromotionDetails;