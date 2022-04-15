import { gql, useQuery } from '@apollo/client';
import React, { FC, Fragment, useContext, useEffect, useState } from 'react';
import { MetricContext } from '../App';


const metricsQuery = gql`
  query {
    getMetrics
  }
`;

const MetricsSelector: FC = () => {
    const { loading, error, data } = useQuery<any>(metricsQuery);
    const [selectValue, setSelectValue] = useState<string>("waterTemp");

    const {state, dispatch} = useContext(MetricContext)

    const handleSelect = (e:any) => {
        setSelectValue(e.target.value)
    }
    useEffect(()=>{
        dispatch({type:"updateMetrics",payload:[selectValue]})
    },[selectValue])
    useEffect(()=>{
    },[data?.getMetrics])
  return <div>
    <select value={selectValue} onChange={handleSelect}>
        {data?.getMetrics.map((metric:string)=>(<Fragment key={metric}><option value={metric}>{metric}</option></Fragment>))}
    </select>
  </div>;
};


export default MetricsSelector
