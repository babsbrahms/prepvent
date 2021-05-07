import React from 'react';
import { Header, Modal, Icon, Image, Divider } from 'semantic-ui-react';
import excelSaveAs from '../../utils/images/excel-save-as.png'
import saveEcxelCsv from '../../utils/images/save-excel-csv.png';

const CsvFormat = () => {
    return (
        <div>
            <Modal trigger={<span style={{marginLeft: '3px', marginRight: '2px' }}> (<a>csv file <Icon name='info' /></a>)</span>} closeIcon>
                <Modal.Header as='h1'>CSV FILE</Modal.Header>
                <Modal.Content>
                <Modal.Description>
                    <Header as='h2'>
                        <Header.Content>
                            What is a csv file
                        </Header.Content>
                    </Header>
                    <p>A Comma Separated Values (CSV) file is a plain text file that contains a list of data. These files are often used for exchanging data between different applications.</p>
                    <p>Microsoft Excel and other spreadsheet software's data can be exported to csv file format</p>
                
                    <Divider />
                    <Header as='h2'>
                        <Header.Content>
                            How to convert Microsoft Excel spreadsheet data to csv format
                        </Header.Content>
                    </Header>
                    <Header>
                        <Header.Content>
                            Step One
                        </Header.Content>
                        <Header.Subheader>
                            Rename columns to common names: email or phone
                        </Header.Subheader>
                    </Header>
                    <Image />

                    <Header>
                        <Header.Content>
                            Step Two
                        </Header.Content>
                        <Header.Subheader>
                            In your Excel workbook, switch to the File tab, and then click Save As. Alternatively, you can press F12 to open the same Save As dialog.
                        </Header.Subheader>
                    </Header>
                    <Image size='small' src={excelSaveAs} />


                    <Header>
                        <Header.Content>
                            Step Three
                        </Header.Content>
                        <Header.Subheader>
                        In the Save as type box, choose to save your Excel file as CSV (Comma delimited).
                        </Header.Subheader>
                    </Header>
                    <Image size="big" src={saveEcxelCsv} />

                    <Header>
                        <Header.Content>
                            Step Four
                        </Header.Content>
                        <Header.Subheader>
                        Choose the destination folder where you want to save your Excel file in the CSV format, and then click Save.
                        </Header.Subheader>
                    </Header>
                    <Divider />
                    <small><a href='https://www.ablebits.com/office-addins-blog/2014/04/24/convert-excel-csv/'>source</a></small>
                </Modal.Description>
                </Modal.Content>
            </Modal>
           
        </div>
    )
}


export default CsvFormat