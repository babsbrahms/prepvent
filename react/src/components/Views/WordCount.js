import React from 'react';
import style from '../Style/Style';

const WordCount = ({ count, maxLength}) => {
    return (
        <div style={{ width: '100%', ...style.alignedRight}}>
            <span style={{ color: (count.length === maxLength)? 'red': 'black'}}>{count.length}/{maxLength}</span>
        </div>
    )
}

export default WordCount;
