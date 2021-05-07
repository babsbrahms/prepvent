import React, { Component } from 'react';


export default class Countdown extends Component {
    constructor(props) {
        super(props);
        this.state ={
            timer: props.timer || 600000,
        }
    }

    componentDidMount() {
        this.addCountDown()
    }

    componentWillUnmount() {
        clearInterval(this.counting)
    }   

    addCountDown = () => {     
        this.counting = setInterval(() => this.decide(), 1000);  
    }

    decide = () => {
        const { timer } = this.state;
        const { cancelPayment  } = this.props;

        if (timer > 0) {
            // event has started
            this.setState({ timer: timer -  1000});
        } else { 
            // close
            clearInterval(this.counting);
            cancelPayment();
        }
    }


    render() {
        const { timer } = this.state;

        return (
            <span> {Math.floor((timer % (1000 * 60 * 60)) / (1000 * 60))}mins : {Math.floor((timer % (1000 * 60)) / (1000))}sec</span>
        )
    }
}