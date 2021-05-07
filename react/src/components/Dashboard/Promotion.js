import React, { Component } from 'react';
import { Icon, Modal, Segment,  Item,  Header, Dropdown, Table, Statistic, Button, Portal, Card, Divider, Message, Grid } from 'semantic-ui-react';
import moment from 'moment';
import style from '../Style/Style';
import PayStack from '../Views/PayStack';
import { getPromotions, createPromotion } from '../../actions/promotion';
import { getCountrySubcriberCount } from '../../actions/register'


import EventUpdate from '../Promotion/EventUpdate';
import FeaturedEvent from '../Promotion/FeaturedEvent';
import MailingList from '../Promotion/MailingList';
import Social from '../Promotion/Social';
import PromotionDetails from '../Views/PromotionDetails';

const promotionList = [
    {name: 'event update', description: 'Promote your event via event update messages to registered attendees. When an organizer changes the date, time, location or cancels an event, we update registered event-goers of these changes. You can promote your event to them (event-goers) as a suggestion of other events they can attend. This method of promotion is very effective because the event-goers are already familiar with the event that was updated. Hence they will be willing to open the email message, thereby seeing your promotion as a suggestion.'},
    {name: 'mailing list', description: 'Promote your event via our weekly mailing list email campaign to boost registration of your event. Our event newsletter audience signed up to recieve event newsletter, hence they are willing and excited to explore new events. We send out group emails every week to our subcribers to inform them of new upcoming events in the locations (states) they have subcribed to. This enable you to promote your event weeks before your event date.'},
    {name: 'featured event', description: 'Promote your event to people who visit our website home page. Our home page has a carousel that displays promoted event posters, and the content on the carousel various for each state in a country. The carousel is designed to be sophisticated and attention grabbing (has you scroll up or down the page, the carousel poster changes). You can target your promotion to people who are searching for event in your selected state.'},
    {name: 'social', description: 'Promote your events via our social media platform (Instagram, Twitter and WhatsApp). We have alot of followers online (you can verify with the link to our social media pages), and you can easy promote your event to our online audience. Our followers know that we specialize in events therefore, they are always searching for new events on our social media pages.'},
]

export default class Promotion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            link: `${props.hostname}/e/${props.eventId}`,
            open: false,
            paymentOpen: false,
            paymentDetails: {
                email: props.email,
                amount: 0,
                
                currency: props.currency,
                response: null,
            },
            newPromotions: [],
            promotions: [],
            promotionIndex: 0,
            current: {},
            modalOPen: false,
            currentIndex: -1,
            openPortal: false,
            openPromotionModal: false,
            loading: true, 
            fetchError: false,
            stateSubcribeCount: [],
            gotStateCount: false,
            gettingStateCount: false,
            selectedPromotion: {}
        }
    }

    componentDidMount() {
        this.getPrevPromos()
    }
    
    getPrevPromos = () => {
        const { eventId, addAlert } = this.props;
        if (eventId !== undefined) {
            this.setState({ loading: true, fetchError: false }, () => {
                getPromotions(eventId)
                .then((res) => this.setState({ promotions: res.data.promotions, loading: false, fetchError: false }))
                .catch(err => {
                    this.setState({loading: false, fetchError: true })
                    addAlert('Error', `${err.response.data.msg || 'Problem getting previous promotions'}`, false, false)
                })
            })
        } else {
            this.setState({ loading: false, fetchError: true })
        }
    }

    getCountryCount = (country) => {
        this.setState({ gettingStateCount: true } , () => {
            getCountrySubcriberCount(country)
            .then(res => {
                this.setState({ stateSubcribeCount: res.data.states, gotStateCount: true, gettingStateCount: false })
            })
            .catch(err => {
                this.setState({ gotStateCount: false, gettingStateCount: false })
            })
        })
    }

    handlePayment = res => {
        const { paymentDetails } = this.state;

        this.setState({ paymentDetails: {...paymentDetails, response: res }}, () => {
            // close payment form and send message
            this.handleClosePayment()
            this.sendCampaign()
        })
    }

    handleOpenPayment = () => this.setState({ paymentOpen: true })

    handleClosePayment = () => this.setState({ paymentOpen: false })

    show = () => this.setState({ open: true })

    handleCancel = () => this.setState({ open: false })

    handleOpenModal = () => this.setState({ modalOpen: true })

    handleCloseModal = () => this.setState({ modalOpen: false })

    addNewPromotion = (method) => {
        const { newPromotions } = this.state;
        const { currency, eventId, userId, name, time, location, poster, published }  = this.props;

        let index = newPromotions.findIndex(x => x.type === method);
        console.log('index: ', index);
        
        if (index > -1) {
            this.editPromotion(index)
        } else {
            this.setState({
                current: {
                    data: {
                        name, 
                        time,
                        location,
                        poster,
                        published
                    },
                    type: method,
                    registartionDate: moment.utc().valueOf(),
                    currency,
                    eventId,
                    userId,
                    details: [],
                    analytics: {
                        sales: 0,
                        clicks: 0,
                        salesRevenue: 0,
                        ticket: {

                        }
                    }
                },
                currentIndex: -1
            }, () => {
                this.handleClosePortal();
                this.handleOpenModal();
            })
        }

    }

    createPromotion = (current) => {
        const { newPromotions, currentIndex } = this.state;

        if (currentIndex === -1) {
            newPromotions.push(current)
        } else {
            newPromotions[currentIndex] = current;
        }

        this.setState({
            newPromotions: [ ...newPromotions ]
        }, () => this.handleCloseModal())

    }

    editPromotion = (index) => this.setState({ current: this.state.newPromotions[index], currentIndex: index }, () => this.handleOpenModal())

    deletePromotion = (index) => {
        const {newPromotions } = this.state;
        newPromotions.splice(index, 1)

        this.setState({ newPromotions: [ ...newPromotions ] })
    }

    handleOpenPortal = () => {
        this.setState({ openPortal: true })
    }

    handleClosePortal = () => {
        this.setState({ openPortal: false })
    }

    submitPromotion = () => {
        const { newPromotions } = this.state;

        let amount =  newPromotions.reduce((prev, curr) => prev + curr.totalCost, 0);

        if (amount > 0) {
            this.setState({
                paymentDetails: {
                    ...this.state.paymentDetails,
                    amount: amount
                }
            }, () => {
                this.handleOpenPayment()
            }) 
        } else {
            this.sendCampaign()
        }

    }

    sendCampaign = () => {
        const { addAlert, eventId} = this.props;
        const { newPromotions, paymentDetails } = this.state;

        addAlert('Info', `Creating new promotion`, true, false);
        console.log('BEFORE: ', newPromotions);
        let promotion = this.unwindPromotion(newPromotions, eventId);
        console.log('AFTER: ', newPromotions);

        createPromotion(promotion, paymentDetails)
        .then((res) => {
            if (res.data.error) {
                addAlert('Error', res.data.error , false, false)
            } else {
                this.setState({ promotions: res.data.promotions, newPromotions: [] })
                addAlert('Success', `${'Promotion successfully added!'}`, true, false)
            }

        })
        .catch((error) => {
            addAlert('Error', `${error.msg || 'Problem adding your promotion'}`, false, false)
        })
    }

    unwindPromotion = (newPromotions, eventId) => {
        let promotions = [];
        let cartId = `${eventId}${moment.utc().valueOf()}` 

        newPromotions.forEach(promo => {
            promo.details.forEach(detail => {
                let current = { ...promo };
                delete current.totalCost;
                delete current.details;
                delete current.cost;
                
                promotions.push({
                    ...current,
                    detail: detail,
                    cartId,
                })
            })
        });

        return promotions;
    }

    getCountryDetails = () => {
        const { addAlert, fetchCountryDetails, location } = this.props;

            addAlert('Info', `Sending request to get cost of services and other details`, true, false)

            fetchCountryDetails(location.country)
        

    }

    render() {
        const { newPromotions, openPortal, current, promotions, openPromotionModal, loading,
             fetchError, gotStateCount, stateSubcribeCount, gettingStateCount, selectedPromotion } = this.state;

        const { poster, tag, time, currency, countryDetails, location, eventId, userId, fetchingCountryDetails, published }  = this.props;

        return (
            <div>

                {/* //PAYMENT FORM */}
                <Modal
                    // trigger={<Button onClick={this.handleOpenPayment}>Show Modal</Button>}
                    open={this.state.paymentOpen}
                    // onClose={this.handleClosePayment}
                    basic
                    size='small'
                >
                    <Header inverted icon="money" content='Make Payment' />
                    <Modal.Content>
                        <PayStack 
                        cancelPayment={() => this.setState({ preparing: false }, () => this.handleClosePayment())}
                        gotPayment={(res) => this.handlePayment(res)} 
                        info={[
                            {
                                display_name: "Event Id",
                                variable_name: "event_id",
                                value: eventId
                            }
                            ,
                            {
                                display_name: "User Id",
                                variable_name: "user_id",
                                value: userId
                            },
                            {
                            display_name: "Description",
                            variable_name: "description",
                            value: "Event promotion"
                        }]}
                        paymentDetails={this.state.paymentDetails}/> 
                    </Modal.Content>
                </Modal>


                <Message>
                    <Message.Header>
                        Weekly Promotions
                    </Message.Header>
                    <Message.Content>
                        We promote all upcoming events via our E-mail newsletter or social media platforms (WhatsApp, Facebook, Twitter and Instagram) a 
                        week before your event.
                    </Message.Content>
                </Message>
                <Portal
                    closeOnTriggerClick
                    openOnTriggerClick
                    open={openPortal}
                    trigger={
                        <div style={style.center}>
                        <Icon size='huge' name='plus circle' color='pink' />
                    </div>
                    }
                    onOpen={this.handleOpenPortal}
                    onClose={this.handleClosePortal}
                >
                    <Segment
                    style={{
                        left: '10%',
                        position: 'fixed',
                        top: '15%',
                        zIndex: 1000,
                        width: '80%',
                        maxHeight: '70%',
                        overflowY: "scroll"
                    }}
                    >
                    <Header textAlign='center' as='h1'>
                        <Header.Content>Select a promotion method</Header.Content>
                    </Header>
                    <Message color='black'>
                        <Message.Header>
                            Analytics
                        </Message.Header>
                        <Message.Content>
                            We provide analytics data for our promotions. We mearsure the total number of clicks on a promotion, and the total number of ticket sales made from these clicks. Furthermore, we calculate the total revenue made from ticket sales due to the promotion and we break down of how the revenue was made (we provide details on the quantity sold per ticket name and total revenue per ticket name).
                        </Message.Content>
                    </Message>
                    <Divider />
                    <Card.Group centered>
                        {promotionList.map(promo => (
                            <Card key={promo.name}>
                                <Card.Content header={promo.name} />
                                <Card.Content description={promo.description} />
                                <Card.Content extra>
                                    <Button disabled={((published === false) || (moment.utc().valueOf() >moment.utc(time.end).valueOf()))} onClick={() => this.addNewPromotion(promo.name)} fluid basic color='green'>
                                        Select
                                    </Button>
                                </Card.Content>
                            </Card>
                        ))}

                    </Card.Group>
                    </Segment>
                </Portal>

                <Modal
                    open={this.state.modalOpen}
                    // onClose={this.handleClose}
                    basic
                    size='fullscreen'
                >
                    <Header icon='bullhorn' content={current.type} subheader="" inverted />
          
                    {(Object.keys(countryDetails).length === 0) && (<Modal.Content>
                        <div style={style.center}>
                            <Button color="pink" size="massive" disabled={fetchingCountryDetails} onClick={this.getCountryDetails}>{(fetchingCountryDetails)? <Icon name="spinner" loading/> : "Get promotion details"}</Button>
                        </div>
                        <br /><br /><br />

                        <div style={style.center}>
                        <Button color='red' onClick={() => this.handleCloseModal()} inverted>  
                            <Icon name='close' /> Close
                        </Button>
                        </div>
                    </Modal.Content>)}



                    {(Object.keys(countryDetails).length > 0) && (<Modal.Content>
                        {(current.type === 'mailing list') && (
                            <MailingList 
                                current={current}
                                currency={currency}
                                location={location}
                                countryDetail={countryDetails}
                                stateSubcribeCount={stateSubcribeCount}
                                gettingStateCount={gettingStateCount}
                                fetchStateCount={(country) => this.getCountryCount(country)}
                                gotStateCount={gotStateCount}
                                closeModal={() => this.handleCloseModal()}
                                save={(data) => this.createPromotion(data)}
                                prevPromos={promotions.filter(x => x.type === 'mailing list')}

                            />
                        )}
                        {(current.type === 'event update') && (
                            <EventUpdate 
                                current={current}
                                currency={currency}
                                location={location}
                                countryDetail={countryDetails}
                                closeModal={() => this.handleCloseModal()}
                                save={(data) => this.createPromotion(data)}
                                prevPromos={promotions.filter(x => x.type === 'event update')}

                            />
                        )}
                        {(current.type === 'featured event') && (
                            <FeaturedEvent 
                                current={current}
                                time={time} 
                                currency={currency}
                                location={location}
                                countryDetail={countryDetails}
                                closeModal={() => this.handleCloseModal()}
                                save={(data) => this.createPromotion(data)} 
                                prevPromos={promotions.filter(x => x.type === 'featured event')}
  
                            />
                        )}
                        {(current.type === 'social') && (
                            <Social
                                time={time} 
                                current={current}
                                poster={poster}
                                link={poster}
                                tag={tag} 
                                currency={currency}
                                location={location}
                                countryDetail={countryDetails}
                                closeModal={() => this.handleCloseModal()}
                                save={(data) => this.createPromotion(data)}
                                prevPromos={promotions.filter(x => x.type === 'social')}
                            />
                        )}
                    </Modal.Content>)}
                </Modal>

                

                {(newPromotions.length > 0) && (
                <Segment>
                    <Item.Group divided>

                        {newPromotions.map((tic, index) => (
                        <Item key={index.toString()}>
                            <Item.Content>
                                <div style={style.spacebetween}>
                                    <Item.Header as='a' onClick={() => this.setState({ selectedPromotion: newPromotions[index], openPromotionModal: true })}>           
                                            {tic.type}
                                    </Item.Header>
                                    

                                    <Dropdown direction='left' icon={<Icon name='ellipsis vertical'/>} compact>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => this.editPromotion(index)}>Edit</Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Dropdown.Item onClick={() => this.deletePromotion(index)}>Delete</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                                <Item.Meta>
                                <span className='cinema'>Cost: {(tic.totalCost).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currency.abbr.toLocaleUpperCase()} </span>
                                </Item.Meta>
                            </Item.Content>
                        </Item>))}   
                    
                    </Item.Group>
                    <p style={{ backgroundColor: 'black', color: 'white', padding: '3px'}}>Disclamer: We do not promote cancelled or ended event. Therefore, if you cancel your event or move up the end date of your event before your promotions end. All your active promotions will stop and we will not provide refunds.</p>
                    <Grid stackable celled>
                        <Grid.Column width='8' textAlign='center'>
                            <Statistic>
                                <Statistic.Label>Total Cost</Statistic.Label>
                                <Statistic.Value>{newPromotions.reduce((prev, curr) => prev + curr.totalCost, 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currency.abbr.toLocaleUpperCase()}</Statistic.Value>    
                                
                            </Statistic>
                        </Grid.Column>
                        <Grid.Column width='8' verticalAlign="middle">
                            <Button color={'pink'} fluid onClick={this.submitPromotion}> Submit Promotion</Button>

                        </Grid.Column>
                    </Grid>
                </Segment>)}
                <Segment inverted>
                    <Header inverted>
                        <Header.Content>Promotions</Header.Content>
                    </Header>

                    <Table compact celled definition>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Type</Table.HeaderCell>
                                <Table.HeaderCell>Registration Date</Table.HeaderCell>
                                <Table.HeaderCell>Cost</Table.HeaderCell>
                                <Table.HeaderCell>Clicks</Table.HeaderCell>
                                <Table.HeaderCell>Sales</Table.HeaderCell>
                                <Table.HeaderCell>Revenue</Table.HeaderCell>
                                <Table.HeaderCell>Details</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {promotions.map((promo, i) => (
                                <Table.Row key={`promotion-${i}`}>
                                    <Table.Cell>{promo.type}</Table.Cell>
                                    <Table.Cell>{moment.utc(promo.registartionDate).utcOffset(time.localOffset).format('MMMM DD, YYYY')}</Table.Cell>
                                    <Table.Cell>{(promo.detail.cost).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {promo.currency.abbr}</Table.Cell>
                                    <Table.Cell>{promo.analytics.clicks}</Table.Cell>
                                    <Table.Cell>{promo.analytics.sales}</Table.Cell>
                                    <Table.Cell>{(promo.analytics.salesRevenue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {promo.currency.abbr}</Table.Cell>
                                    <Table.Cell>
                                        <Button color='black' size={'small'} onClick={() => this.setState({ selectedPromotion: { ...promotions[i], details: [promotions[i].detail]}, openPromotionModal: true })}>View Details</Button>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>                        
                    </Table>
                    <div style={style.center}>
                        {(loading) && (<Icon name='spinner' loading />)}
                        {fetchError && <Button disabled={loading} size={'mini'} onClick={this.getPrevPromos}>get promotions</Button>}
                    </div>

                    
                    <Modal 
                        open={openPromotionModal} 
                        onOpen={() => this.setState({ openPromotionModal: true })} 
                        onClose={() => this.setState({ openPromotionModal: false })} 
                        closeIcon>
                            <Modal.Header>{selectedPromotion.type}</Modal.Header>
                            <Modal.Content>
                                <Modal.Description>
                                   <PromotionDetails promotion={selectedPromotion} currency={currency} time={time}/>
                                </Modal.Description>
                            </Modal.Content>

                        </Modal>
                </Segment>
            </div>
        )
    }
}


