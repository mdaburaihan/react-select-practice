import { useEffect, useRef, useState } from 'react'
import styles from './select.module.css'

export type SelectOption = {
    label: string
    value: string | number
}

type SingleSelectProps = {
    multiple?: false
    value?: SelectOption
    onChange: (value: SelectOption | undefined) => void
}

type MultiSelectProps = {
    multiple: true
    value: SelectOption[]
    onChange: (value: SelectOption[]) => void
}

type SelectProps = {
    options: SelectOption[]
} & (SingleSelectProps | MultiSelectProps)

export function Select({ multiple, value, onChange, options }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    function clearOptions(){
        multiple ? onChange([]) : onChange(undefined)
    }

    function selectOption(option: SelectOption){
        if(multiple){
           const option_values = value.map(obj => obj.value)
            if(option_values.includes(option.value)){
                onChange(value.filter(o => o.value !== option.value))
            }else{
                onChange([...value, option])
            }
        }else{
            if(option.value !== value?.value){
                onChange(option)
            }
        }
    }

    function isOptionSelected(option: SelectOption){
        return (multiple) ? value.includes(option) : option.value === value?.value
    }

    useEffect(() => {
        if(isOpen) setHighlightedIndex(0)
    }, [isOpen])

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if(e.target != containerRef.current){
                return
            }
            switch(e.code){
                case "Enter":
                case "Space":
                    setIsOpen(prev => !prev)
                    if(isOpen) selectOption(options[highlightedIndex])
                break;
                case "ArrowUp":
                case "ArrowDown":{
                    console.log(e.code)
                    if(!isOpen){
                        setIsOpen(true)
                        break
                    }
                    const newValue = highlightedIndex + (e.code === 'ArrowDown' ? 1 : -1)
                    if(newValue>0 && newValue<options.length){
                        setHighlightedIndex(newValue)
                    }
                }
                break;
            }
        }
        containerRef.current?.addEventListener("keydown", handler)

        return (() => {
            containerRef.current?.removeEventListener("keydown", handler)
        })
    },[isOpen, options, highlightedIndex])

    return (
        <div
            ref={containerRef}
            onBlur={()=>setIsOpen(false)} 
            onClick={()=>setIsOpen(prev => !prev)}
            tabIndex={0}
        className={styles.container}>
            <span className={styles.value}>{multiple ? value.map(val => <button key={val.value} value={val.value} onClick={(e)=> {
                e.stopPropagation()
                selectOption(val)
            }} className={styles['option-badge']}>{val.label}<span className={styles['remove-btn']}>&times;</span></button>) : value?.label}</span>
            <button 
                onClick={e => {
                    e.stopPropagation()
                    clearOptions()
                }} 
                className={styles['clear-btn']}
            >&times;</button>
            <div className={styles.divider}></div>
            <div className={styles.caret}></div>
            <ul className={`${styles.options} ${ isOpen ? styles.show : "" }`}>
                {
                    options.map((option, index) => (
                        <li
                         onClick={e => {
                            e.stopPropagation()
                            selectOption(option)
                            setIsOpen(false)
                         }}
                         onMouseEnter={() => setHighlightedIndex(index)}
                         key={option.value} 
                         className={`
                            ${styles.option} 
                            ${isOptionSelected(option) ? styles.selected : ""}
                            ${index === highlightedIndex ? styles.highlighted : ""}
                        `}>{option.label}</li>
                    ))
                }
            </ul>
        </div>
    )
}