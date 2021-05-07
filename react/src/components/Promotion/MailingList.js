import React, { Component } from 'react';
import { Segment, Confirm, Button, Icon, Dropdown, Header, Message } from 'semantic-ui-react';
// import momemt from 'moment';
import style from '../Style/Style';

import { MailingListTable } from '../Table/MailingListTable';


export default class MailingList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            current: props.current,
            gotFollowers: false,
            gettingFollowers: false,
            totalCost: 0,
            error: '',
            promoError: {},
            disableState: false,
            stateCount: props
        }
    }

    // componentDidMount() {
    //     const { current, location, countryDetail } = this.props;

    //     if (current.details.length === 0) {
    //         this.setState({
    //             current: {
    //                 ...this.props.current,
    //                 details: [
    //                     {
    //                         state: location.state,
    //                         country: location.country,
    //                         followers: 0,
    //                         costPerMessage: countryDetail.mailingListCostPerMail || 0,
    //                         cost: 0,
    //                         done: false,
    //                         clicks: 0,
    //                     }
    //                 ]
    //             }
    //         })
    //     }
    // }
    
    componentDidMount() {
        const { gotStateCount, countryDetail, fetchStateCount } = this.props;

        if (gotStateCount === false) {
            fetchStateCount(countryDetail.name)
        }
    }
    
    show = () => this.setState({ open: true })
    handleConfirm = () => this.setState({ open: false }, () => {
        const { closeModal } = this.props;
        closeModal()
    })
    handleCancel = () => this.setState({ open: false })

    addStateToPromo = data => {
        ///console.log(data);
        
        this.setState({ promoError: {}, disableState: true }, () => {
            const proof = this.validatePromo(data);
            if (Object.keys(proof.error).length === 0) {
        
                this.setState({
                    current: {
                        ...this.state.current,
                        details: proof.details
                    },
                    gotFollowers: false,
                    disableState: false,
                    totalCost: proof.details.reduce((acc, curr) => acc + (curr.costPerMessage * curr.followers), 0)
                })
            } else {
                this.setState({ promoError: proof.error, disableState: false })
            }
        })
    }

    validatePromo = (data) => {
        const { location, countryDetail, prevPromos, stateSubcribeCount }  = this.props;
        let details = []
        let error = {}

        data.value.forEach(value => {
            let conflict = [];
            prevPromos.forEach(prev => {
                // prev.detail.forEach(detail => {
                    if ((value === prev.detail.state) && (prev.detail.done === false)) {
                        conflict.push(`You already have mailing list promotion for ${prev.detail.state} state scheduled for this week. You can add a new promotion next week.`)
                    }
                // })
            });

            if (conflict.length > 0) {
                error.conflict = conflict;
            } else {
                let stateIndex = stateSubcribeCount.find(x => x.state === value)
                details.push({
                    state: value,
                    country: location.country,
                    followers: stateIndex.count,
                    costPerMessage: countryDetail.mailingListCostPerMail,
                    cost: Number((stateIndex.count * countryDetail.mailingListCostPerMail).toFixed(2)),
                    done: false,
                    // clicks: 0,
                    // sales: 0,
                })
            }
        })

        return { details, error }
    }

    // getStateFollower = () => {
    //     const { current } = this.state;

    //    const states = current.details.map((dt) => dt.state)
    // }

    submitPromotion = async () => {
        const { current , gotFollowers} = this.state;
        const { save } = this.props;

       await this.setState({ error: '' })

        const error = this.validate(current, gotFollowers)
        
       await this.setState({ error })

        if (error.length === 0)  {
            this.setState({
                current: {
                    ...this.state.current,
                    totalCost: Number((current.details.reduce((acc, curr) => acc + (curr.costPerMessage * curr.followers), 0)).toFixed(2)) 
                }
            }, () => save(this.state.current))
        }

        
    }

    validate = (current, gotFollowers) => {
        const {prevPromos} = this.props;  
        let error = ''

        console.log('prevPromos: ', prevPromos);
        if (current.details.length === 0) error = 'No promotion added!';
        //if ((current.details.length > 0) && !gotFollowers) error = 'No promotion added!';

        return error;
    }

    render() {
        const { current, totalCost, gettingFollowers, error, promoError, disableState } = this.state;
        const { countryDetail, currency,  stateSubcribeCount, gotStateCount, gettingStateCount, fetchStateCount}  = this.props;

        return (
            <div>
                <Confirm
                    open={this.state.open}
                    content='Are you sure you want to cancel promotion?'
                    onCancel={this.handleCancel}
                    onConfirm={this.handleConfirm}
                    cancelButton='Never mind'
                    confirmButton="Yes"
                />
                <Segment loading={gettingStateCount}>
                    <Header content="Select promotion states for this week campaign" />
                    {(!!promoError.conflict) && (
                        <ul>
                            {promoError.conflict.map((conflict, i) => <li style={{ color: 'red'}} key={`conflict-${i}`}>{conflict}</li>)}
                        </ul>
                    )}
                    {(gotStateCount) && (
                    <Dropdown 
                        placeholder='Select the states you want to promote your event' 
                        fluid multiple 
                        selection 
                        search
                        disabled={disableState}
                        options={stateSubcribeCount.map(sub => ({ key: sub.state, text: sub.state, value: sub.state }))} 
                        // defaultValue={current.details.map((dt) => dt.state)} 
                        value={current.details.map((dt) => dt.state)}
                        onChange={(e, data) => this.addStateToPromo(data)} 
                    />)}

                    <div style={style.center}>
                        {(!gotStateCount) && (
                        <Button 
                        color={'pink'}
                        size={'mini'}
                        disabled={gettingStateCount} 
                        onClick={() => fetchStateCount(countryDetail.name)}>
                            Get info on mailing list states
                        </Button>)}
                    </div>

                    <MailingListTable
                        details={current.details} 
                        currency={currency} 
                        gotFollowers={gettingFollowers} 
                        // approve={this.getStateFollower} 
                        totalCost={totalCost}
                        view={false}
                    />

                </Segment>


                {(!!error) && (<Message error>
                    <Message.Header>Error</Message.Header>
                    <Message.Content>{error}</Message.Content>
                </Message>)}
                <div style={style.alignedRight}>
                    <Button color='red' onClick={() => this.show()} inverted>  
                        <Icon name='close' /> Cancel
                    </Button>
                    <Button color='green' onClick={() => this.submitPromotion()} inverted>
                        <Icon name='checkmark' /> Save
                    </Button>
                </div>
            </div>
        )
    }
}
