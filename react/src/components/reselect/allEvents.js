import { createSelector } from 'reselect';

const getEvent = (state, props) => state.events.allEvents.find(x => x._id === props.match.params.eventId)

const getEventById = createSelector(getEvent, res => res);

export default getEventById;