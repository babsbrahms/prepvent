import { store } from '../../index';
import { LIKE_EVENT } from '../../types'

const likes = (event) => {
    if (event) {
       let bookmark = JSON.parse(sessionStorage.getItem('likes'));

       if (bookmark === null) {
            bookmark = [];
            bookmark.push(event);
            sessionStorage.setItem('likes', JSON.stringify(bookmark))
            store.dispatch({
                type: LIKE_EVENT,
                payload: bookmark.length
            })
       } else {
           let index = bookmark.findIndex(x => (x._id === event._id))
            
           if (index < 0) {
                bookmark.push(event);
                sessionStorage.setItem('likes', JSON.stringify(bookmark))
                store.dispatch({
                    type: LIKE_EVENT,
                    payload: bookmark.length
                })
           }
       }
    }
}

export default likes