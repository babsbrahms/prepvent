import React from 'react';
import { Header } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const BottomHeader = ({ moveUp }) => {
    return (
        <div style={{ marginTop: '30px', position: 'fixed', bottom: 0, left: 0, width: '100%' }}>
            {/* <div style={{ display: 'flex',  flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-end', padding: 3 }}>
                <div style={{ padding: '3px', backgroundColor: '#ffffff', borderRadius: '2px'}}>
                    <Icon name='angle double up' size='big' onClick={() => moveUp()} />
                </div>
            </div> */}
            <div style={{ backgroundColor: '#e61a8d', padding: '15px', zIndex: 10 }} color='pink'>
            <Header as='h5' textAlign='center'>
                <Link style={{ color: 'black'}} to='/'>PrepVENT</Link>
                <Header.Subheader>
                    <Link style={{ color: 'black'}} to='/privacy'>Privacy Policy</Link> | <Link style={{ color: 'black'}} to='/terms'>Terms and Conditions</Link> | <Link style={{ color: 'black'}} to='/refund'>Refund Policy</Link> | <Link style={{ color: 'black'}} to='/contact'>Contact Us</Link>
                </Header.Subheader>
            </Header>
            </div>
        </div>
    )
}

export default BottomHeader