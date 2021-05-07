
const emailTemplate = [
    {
        id: 0,
        name: 'Email Template NO 1',
        style: (words) => `
        <div style="width: 95%; margin:auto; background-color: white"><div id="top" style="background-color: white; border-width: 3px; border-style:solid; border-color:rgba(251, 241, 38, 255); min-height: 50px; border-top-width: 0px; border-right-width: 0px; border-radius: 5px; margin-right: 5; padding-left: 8px; margin-bottom: 0px">
            <p>${words}</p>
            </div><div id="bottom" style="background-color: white; border-width: 2px; border-style:solid; border-color:rgba(251, 241, 38, 255); min-height: 20px; border-bottom-width: 0px; border-left-width: 0px;border-right-width: 3px; border-radius: 5px; width: 100%; background-image: linear-gradient(to left,rgba(125,234,241,155),rgba(231,235,43,0)); display: flex; flex-direction: row-reverse; margin-top: 0px;">
                <small style="color: gray; text-align:right; float: right;">Powered by PrepVENT</small>
            </div>
        </div>
        `
    },
    {
        id: 1,
        name: 'Email Template NO 2',
        style: (words) => `
        <div style="width: 95%; margin:auto; background-color: rgba(251,251,154,253); border-width: 2px; border-style:solid; border-color: rgba(251,251,154,253); border-radius: 10px; padding-left: 8px; box-shadow: 2px 2px 4px goldenrod">
            <p>${words}</p>
            <div id="bottom" style="background-color: rgba(252,120, 127,253); border-width: 2px; border-style:solid; border-color:rgba(221, 234, 192, 255); min-height: 20px; padding: 2px; margin: 5px; border-radius: 6px; display: flex; flex-direction: row; justify-content: center; ">
                <small style="color: rgb(82, 78, 78); text-align: center; padding: 0px; margin: 0px;">Powered by PrepVENT</small>
            </div>
        </div>
        `
    },
    {
        id: 2,
        name: 'Email Template NO 3',
        style: (words) => `
        <div style="width: 95%; margin:auto; background-color: white; border-width: 2px; border-style:solid; border-color: rgba(255,170,170,255); border-radius: 10px; padding-left: 8px; box-shadow: 3px 3px 4px rgb(202, 193, 169); min-height: 100px;">
            <div style="width: 100%">
                <p style="color: gray; text-align: center; padding: 0px; margin: 0px;">Powered by PrepVENT</p>
            </div>
            <div id='v-line' style="width: 97%; padding: 3px; border-width: 2px; border-color: rgba(255,170,170,255); border-style: solid; border-radius: 10px;color: gray; text-align: center;"></div>
            <p style="flex: 1">${words}</p>
        </div>
        `
    },
    {
        id: 3,
        name: 'Email Template NO 4',
        style: (words) => `
        <div style="width: 95%; margin:auto; background-color: white">
            <div style="margin: 0; padding: 0">
                <div id="rectangle" style="background-color: rgba(168, 213, 213, 235); width: 100%; min-height: 70px; border-top-right-radius: 5px; border-top-left-radius: 5px; margin: 0; padding: 0">
                    <p style="margin: 0; padding: 5px"> ${words}</p>     
                </div>
                <div id="Bottomcontainer" style="display: flex; flex-direction: row; justify-content: space-between; align-items: flex-start; height: 50px; margin: 0; padding: 0">
                    <div id="bottomLeft" style="flex:1; width: 100%; height: 100%;  ">
                        <div id="line" style="background-color: white; width: 100%; height: 5px;"></div>
                        <div style=" width: 100%; display: flex; flex-direction: row; justify-content: flex-start; align-items: center; 
                        background-image: linear-gradient(to right,rgba(225,78,160,124), white); padding-left: 5px; height: 100%; ">
                            <h5 style="color: wheat; margin: 0; flex: 1">Powered by PrepVENT</h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `
    },
    {
        id: 4,
        name: 'Email Template NO 5',
        style: (words) => `
        <div style="width: 95%; margin:auto; "> 
            <div style="margin: 0; padding: 5px; background-color: rgba(213, 213, 255, 255); width: 100%; min-height: 70px; border-top-left-radius: 5px; border-bottom-left-radius: 5px;">
               <p> ${words}</p>
            </div>
            <div id="first" style="display: flex; width: 100%;  background-image: linear-gradient(rgba(186,252,218,248), white);" >
                <small style="color: gray;">Powered by PrepVENT</small>
            </div>
        </div>
        `
    },
    {
        id: 5,
        name: 'Email Template NO 6',
        style: (words) => `
        <div style="width: 95%; margin:auto; background-color: rgba(254,106,108,205); border-width: 2px; border-style:solid; border-color: rgba(254,106,108,205); border-radius: 10px; padding-left: 3px; box-shadow: 2px 2px 4px grey; display: flex; flex-direction: column; justify-content: flex-start; align-items: center; ">
            <div id="bottom" style="background-color: rgba(237,232, 236,211); border-width: 2px; border-style:solid; border-color:rgba(221, 234, 192, 255); min-height: 85%; padding: 4px; margin: 3px; border-radius: 6px; display: flex; flex-direction: column; margin-top: 0; width: 100%; ">
                <p>${words}</p>   
            </div><small style="color: gray; text-align: center; padding: 0; margin: 0;">Powered by PrepVENT</small>
        </div>
        `
    },
    {
        id: 6,
        name: 'Email Template NO 7',
        style: (words) => `
        <div style="width: 95%; margin:auto; background-color: #0088b17c; border-width: 2px; border-style:solid; border-color: #0088b17c; border-radius: 10px; box-shadow: 2px 2px 4px rgb(142, 172, 184); display: flex; flex-direction: row; justify-content: center; padding: 10px; padding-right: 2px">
            <div id="bottom" style="background-color: white; border-width: 2px; border-style:solid; border-color: white; min-height: 85%; border-radius: 6px; display: flex; flex-direction: column; margin-top: 0; flex: 1; width: 83% ">
                <p>${words}</p>  
            </div>
            <div style="display: flex; flex-direction:row; justify-content: center; align-items:center; width: 17%; word-break: normal;">
                <small style="color: #000000; background-color: transparent; padding: 0; margin: 0; text-align: center">Powered by PrepVENT</small>
            </div>
        </div>
        `
    },
    {
        id: 7,
        name: 'Email Template NO 8',
        style: (words) => `
        <div style="width: 95%; margin:auto; background-color: white; border-radius: 10px; padding-left: 8px; box-shadow: 4px 4px 4px grey; border-width: 1px; border-style:solid; border-color: #e8ecee7c;">
            <p>${words}</p>   
            <small style="color: gray; text-align: center; padding: 0; margin: 0;">Powered by PrepVENT</small>
        </div>
        `
    },
    // {
    //     id: 8,
    //     name: 'Email Template NO 9',
    //     style: (words) => `
    //     <div style="width: 95%; margin:auto;">
    //         <p>${words}</p> 
    //     </div>
    //     `
    // },
];

// export const findTemplateByName = (name) => {
//     if (name === 'squareCircleShape') {
//         return squareCircleShape
//     } else {
//         const style = emailTemplate.find(x => x.name === name)
//         return style
//     }
// }

export default emailTemplate;