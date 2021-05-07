import React from 'react';
import { Icon } from 'semantic-ui-react'
import {
    EmailShareButton,
    FacebookShareButton,
    // InstapaperShareButton,
    // LineShareButton,
    LinkedinShareButton,
    // LivejournalShareButton,
    // MailruShareButton,
    // OKShareButton,
    PinterestShareButton,
    // PocketShareButton,
    RedditShareButton,
    TelegramShareButton,
    TumblrShareButton,
    TwitterShareButton,
    ViberShareButton,
    // VKShareButton,
    WhatsappShareButton,
    // WorkplaceShareButton,
  } from "react-share";

const Share = ({ title, image, tag, description, url, size }) => {
    return (
        <div style={{ flex: 1 }}>
             <EmailShareButton subject={title} body={description} url={url} >
                <Icon name="mail" size={size} />
            </EmailShareButton>
            <FacebookShareButton quote={description} hashtag={`#${tag}`} url={url}>
                <Icon name="facebook" size={size} />
            </FacebookShareButton>
            <LinkedinShareButton title={title} summary={description} source={'PrepVENT'} url={url}>
                <Icon name="linkedin" size={size} />
            </LinkedinShareButton>
            <PinterestShareButton title={title} media={image} description={description} url={url}>
                <Icon name="pinterest" size={size} />
            </PinterestShareButton>
            <TumblrShareButton title={title} tags={[`${tag}`]} caption={description} url={url}>
                <Icon name="tumblr" size={size} />
            </TumblrShareButton>
            <TelegramShareButton title={title} url={url}>
                <Icon name="telegram" size={size} />
            </TelegramShareButton>
            <RedditShareButton title={title} url={url}>
                <Icon name="reddit" size={size} />
            </RedditShareButton>
            <TwitterShareButton title={title} via={'PrepVENT'} hashtags={[`${tag}`]} url={url}>
                <Icon name="twitter" size={size} />
            </TwitterShareButton>
            <ViberShareButton title={title} url={url}>
                <Icon name="viber" size={size} />
            </ViberShareButton>
            <WhatsappShareButton title={title} url={url}>
                <Icon name="whatsapp" size={size} />
            </WhatsappShareButton> 
        </div>
    )
}

export default Share;