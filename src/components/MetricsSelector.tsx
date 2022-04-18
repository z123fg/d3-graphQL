import { gql, useQuery } from '@apollo/client';
import {TextField } from '@material-ui/core';
import { Autocomplete } from '@mui/material';
import React, { FC, useContext, useEffect, useState } from 'react';
import { MetricContext } from '../App';


const metricsQuery = gql`
  query {
    getMetrics
  }
`;

const MetricsSelector: FC = () => {
  const { loading, error, data } = useQuery<any>(metricsQuery);
  const [selectValue, setSelectValue] = useState<any>([]);

  const { state, dispatch } = useContext(MetricContext)

  const handleSelect = (e: any) => {

  }
  useEffect(() => {
    dispatch({ type: "updateMetrics", payload: selectValue })
  }, [selectValue])
  useEffect(() => {
  }, [data?.getMetrics])

  const handleChange = (e:any,newValue:any) => {
    setSelectValue(newValue)
  }
  return <div>

    {data && <Autocomplete
      multiple
      onChange={handleChange}
      value={selectValue}
      getOptionLabel={option=>option}
      disablePortal
      id="combo-box-demo"
      options={data?.getMetrics}
      sx={{ width: 800 }}
      renderInput={(params) => <TextField {...params} label="Metrics" />}
    />}


  </div>;
};


export default MetricsSelector
