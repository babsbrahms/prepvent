import React from 'react';
import {Helmet} from "react-helmet";

const HtmlHeader = ({ page }) => {
    return (
        <Helmet 
            title= {`PrepVENT |${!!page? ` ${page} |`: ''} Event ticketing, promotion, poster, sharing, management e.t.c all in one app.`}
            meta={[
                {"name": "description", "content": "Simpfy event planning by connecting event organizers and event goers via event pages, poster creation, promotion, sharing (socail media, bulk sms and email), messaging(sms and email), ticketing, registration and check-in"},
            ]}
        />
    )
}

export default HtmlHeader;