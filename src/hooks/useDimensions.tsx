import { RefObject, useEffect, useRef, useState } from "react"

interface ISvgContainerDimensions{
  width:number;
  height:number
}
export default function useDimensions(elRef:RefObject<HTMLElement>):ISvgContainerDimensions {
    const [dimensions, setDimensions ] = useState({width:0,height:0})
  
    const observer = useRef(
      new ResizeObserver((entries:ResizeObserverEntry[] )=> {
        const {inlineSize,blockSize} = entries[0].borderBoxSize[0]
        setDimensions({width:inlineSize,height:blockSize})
      })
    )
  
    useEffect(() => {
      if (elRef.current) {
        observer.current.observe(elRef.current)
      }
  
      return () => {
        if (elRef.current) {
        observer.current.unobserve(elRef.current)
        }
      }
    }, [elRef, observer])
  
    return dimensions
  }