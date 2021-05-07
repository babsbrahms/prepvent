import React, { Component } from 'react';
import {Icon} from 'semantic-ui-react';
import Coverflow from 'react-coverflow';
import { Link } from 'react-router-dom';
import '../Style/carousel.css'
// import AwesomeSlider from 'react-awesome-slider';
// import 'react-awesome-slider/dist/custom-animations/cube-animation.css';

export default class Carousel extends Component {
    constructor (props) {
        super(props);

        this.state = {
            currentIndex: 0,
           // bigSize: document.body.clientWidth >= 481,
        }

        this.lastVal= window.pageYOffset;
    }
    
      

    componentDidMount() {
        const { images } = this.props;

        // window.addEventListener('resize', this.reportWindowSize);
        window.addEventListener('scroll', this.scrollView);

        if (document.getElementById('prepvent-carousel') !== null) {
            document.getElementById('prepvent-carousel').style.backgroundImage = `url(${images[this.state.currentIndex].data.poster})`
        }
 
        //this.changeImage()
    }

    componentWillUnmount() {
        // window.removeEventListener('resize', this.reportWindowSize);
        window.removeEventListener('scroll', this.scrollView)
       // clearInterval(this.timer)
    }
    

    // reportWindowSize = () => {   
    //     if (document.body.clientWidth >= 481) {
    //         if(!this.state.bigSize) {
    //             this.setState({ bigSize: true })
    //         }
    //     } else {
    //         if(this.state.bigSize) {
    //             this.setState({ bigSize: false })
    //         }
    //     }
    // }

    // changeImage = () => {
    //     const { currentIndex } = this.state;
    //     const { images } = this.props;
    //     this.timer = setInterval(() => {
    //         if(!this.state.bigSize) {
    //             this.nextItem()
    //         }
    //     }, 3000)
    // }

    scrollView = e => {
        if ((window.pageYOffset < document.body.clientHeight) && !this.props.bigSize) {
           if (Number.isInteger(window.pageYOffset/20)) {
            
               if(this.lastVal > window.pageYOffset) {
                   this.lastVal= window.pageYOffset
                   this.prevItem()
               } else {
                   this.lastVal = window.pageYOffset;
                   this.nextItem()
               }
               
           }
            
        }
          
    }

    nextItem = () => {
        const { currentIndex } = this.state;
        const { images } = this.props;

        if (currentIndex === (images.length - 1)) {
            this.setState({ currentIndex: 0 })
        } else {
            this.setState({ currentIndex:  (currentIndex +1) })
        }
        if (document.getElementById('prepvent-carousel') !== null) {
            document.getElementById('prepvent-carousel').style.backgroundImage = `url(${images[this.state.currentIndex].data.poster})`
        }    
    }

    prevItem = () => {
        const { currentIndex } = this.state;
        const { images } = this.props;
        if (currentIndex === 0) {
            this.setState({ currentIndex: (images.length - 1) })
        } else {
            this.setState({ currentIndex: (currentIndex - 1 )})
        }
        if (document.getElementById('prepvent-carousel') !== null) {
            document.getElementById('prepvent-carousel').style.backgroundImage = `url(${images[this.state.currentIndex].data.poster})`
        }
    }


    render() {
        const { currentIndex } = this.state;
        const { images, bigSize } = this.props;
        
        if (bigSize) {
            return (
                <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center' }}> 
                    <Coverflow
                        displayQuantityOfSide={2}
                        navigation={false}
                        infiniteScroll
                        enableHeading
                        media={{
                        '@media (max-width: 900px)': {
                            width: '700px',
                            height: '300px'
                        },
                        '@media (min-width: 900px)': {
                            width: '900px',
                            height: '400px'
                        }
                        }}
                    >
                        {images.map((data, index) => (
                            <img key={index} src={data.data.poster} alt={`${data.data.name.substr(0,12)} ${data.data.name.length > 12? '...': ''}`} data-action={`/e/${data.eventId}?pid=${data._id}`}/>
                        ))}                        
                    </Coverflow>
                </div>
            )

        } else {
            return(
                <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '230px'}}>
                    <div style={{ height: 0, width: 0}}>
                        {images.map((data, index) => (
                            <img key={index} src={data.data.poster} alt={data.data.name} style={{ height: 0, width: 0}}/>
                        ))} 
                    </div> 
                    <div id='prepvent-carousel'>
                        <div style={{ width: '12.5%'}}>
                            <Icon className='prep-icon' name='angle left' size='big' onClick={() => this.prevItem()} />           
                        </div>
                        <Link to={`/e/${images[currentIndex].eventId}?pid=${images[currentIndex]._id}`} style={{ width: '85%', height: '230px', overflowY: 'hidden'}}>

                        </Link>
                        <div style={{ width: '12.5%'}}>
                            <Icon  className='prep-icon' name='angle right' size='big' onClick={() => this.nextItem()} />
                        </div>
                    </div>
                </div> 
            )
        }
    }
}

