import React from 'react';
import { Form, Icon } from 'semantic-ui-react';
import WordCount from '../Views/WordCount';

const Profile = ({ user, onChange, onUploadImage, edit }) => {
    return (
        <div>
        <Form>
            <Form.Field>
                <label>Profile Picture<Icon name="asterisk" color='red' size='mini' /></label>
                {/* <Image src={user.photoUrl} fluid /> */}
                <input accept='.png, .jpg, .jpeg' onChange={e => onUploadImage(e)} name='photoUrl' type="file" placeholder='Upload profile picture'/>
            </Form.Field>
            <Form.Field>
            <label>Name<Icon name="asterisk" color='red' size='mini' /></label>
            <input defaultValue={user.name} name='name' type='text' onChange={(e) => onChange(e.target)} placeholder='Enter your name or business name'/>
            </Form.Field>
            <Form.Field>
            <label>Email<Icon name="asterisk" color='red' size='mini' /></label>
            <input defaultValue={user.email} disabled={edit} name='email' type='email' onChange={(e) => onChange(e.target)} placeholder='Enter your email address'/>
            </Form.Field>
            <Form.Field>
            <label>Phone number<Icon name="asterisk" color='red' size='mini' /></label>
            <input defaultValue={user.phoneNumber} name='phoneNumber' type='tel' onChange={(e) => onChange(e.target)} placeholder='Enter your phone number'/>
            </Form.Field>
            <Form.Field>
            <label>Description<Icon name="asterisk" color='red' size='mini' /></label>
                <textarea key={'profileDescription'} maxLength={300}  name="description" defaultValue={user.description} onChange={(e) => onChange(e.target)} placeholder={'Describe what your organization does and the type of events people can expect from you.'} />
            </Form.Field>
        </Form>
        <WordCount key='description-count' count={user.description} maxLength={300} />

    </div>
    )
}

export default Profile
