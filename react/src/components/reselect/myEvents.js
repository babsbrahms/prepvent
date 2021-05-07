import { createSelector } from 'reselect';

const getEvent = (state, props) => state.events.myEvents.find(x => x._id === props.match.params.eventId);

const getEventById = createSelector(getEvent, res => res);

export default getEventById;