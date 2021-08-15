import React, { Component } from "react";
import { TextField, MenuItem } from '@material-ui/core';
import { productService } from '../services/productService.js'

export class ProductDetails extends Component {

    state = {
        product: null,
        primaryImg: null,
        dropdownsValues: null,
        updatedAttributes: null,
        mapAttributeIdToLabelData: {},
        quantity: 1,
    }

    componentDidMount() {
        this.loadProduct()
    }

    loadProduct = async () => {
        const { id } = this.props.match.params
        const product = await productService.getById(id)
        const primaryImg = product.images[0]
        const { updatedAttributes, dropdownsValues } = this.getMatchingPropertiesByImage(product, primaryImg)
        this.setState({ product, primaryImg, updatedAttributes, dropdownsValues })
    }


    getMatchingPropertiesByImage = (product, primaryImg) => {
        const matchingVariants = this.getMatchingVariants(product, primaryImg)
        const attributeToLabelsMaps = this.getAttributeToLabelsMaps(matchingVariants)
        const updatedAttributes = this.getUpdatedVariantAttributes(product, attributeToLabelsMaps)
        const dropdownsValues = this.createDropdownsValues(updatedAttributes)
        return { updatedAttributes, dropdownsValues }
    }

    // returns variants with the same image property as primaryImg
    getMatchingVariants = (product, primaryImg) => {
        return product.variants.filter(({ image: { title } }) => title === primaryImg.title)
    }


    // creating an array of objects which includes attribute id and matching label ids
    // for example [{attribute_id:'1',labelsIds:['2']},{attribute_id:'2',labelsIds:['2','3']}]
    getAttributeToLabelsMaps = (variants) => {
        const attributeToLabelsMaps = variants.reduce(
            (accumulator, variant) => {
                const labels = variant.labels
                for (let i = 0; i < labels.length; i++) {
                    //getting the index of the object with the attribute id
                    const index = accumulator.findIndex(({ attribute_id }) => attribute_id === labels[i].attribute_id)
                    if (index > -1) {
                        const currLabelId = labels[i].label_id
                        if (!accumulator[index].labelsIds.includes(currLabelId)) {
                            accumulator[index].labelsIds.push(currLabelId)
                        }
                    }
                    else {
                        const obj = { attribute_id: labels[i].attribute_id, labelsIds: [labels[i].label_id] }
                        accumulator.push(obj)
                    }
                }
                return accumulator
            }, []
        )
        return attributeToLabelsMaps
    }

    // create a new attributes array with updated labels according to attributeToLabelsMaps array
    getUpdatedVariantAttributes = (product, attributeToLabelsMaps) => {
        const attributes = product.attributes
        return attributeToLabelsMaps.reduce(
            (accumulator, mapObj) => {
                //find a matching attribute and create a shallow copy
                const matchedAttribute = { ...attributes.find(({ id }) => id === mapObj.attribute_id) }
                // create a new labels array
                const updatedLabels = matchedAttribute.labels.filter(({ id }) => mapObj.labelsIds.includes(id))
                // create a new attribute object (pushing updatedLabels to matchedAttributes will change the original attributes array)
                const newAttribute = {
                    id: matchedAttribute.id,
                    title: matchedAttribute.title,
                    type: matchedAttribute.type,
                    labels: updatedLabels

                }
                accumulator.push(newAttribute)
                return accumulator
            }, []
        )
    }

    // creates a dropdown values object were key is an attribute id and value is labels data
    // for example {'1':'brown', '2':'large'}
    createDropdownsValues = (updatedAttributes) => {
        const dropdownsValues = {}
        updatedAttributes.forEach((attribute) => {
            dropdownsValues[attribute.id] = attribute.labels.length === 1 ? attribute.labels[0].data : ''
        })
        return dropdownsValues
    }

    //updates dropdown values object with new attribute/label pair
    updateDropDownValues = (attributeId, labelData) => {
        const { dropdownsValues } = this.state
        dropdownsValues[attributeId] = labelData
        this.setState({ dropdownsValues })
    }

    //update properties when selecting new image from gallery
    onSelectImage = (img) => {
        const { product } = this.state
        const { updatedAttributes, dropdownsValues } = this.getMatchingPropertiesByImage(product, img)
        this.setState({ primaryImg: img, dropdownsValues, updatedAttributes })
    }

    //when selecting new dropdown value
    handleChange = (prop) => ({ target }) => {
        const attributeId = prop
        const labelData = target.value
        this.updateDropDownValues(attributeId, labelData)
    }


    // returns a variant from product.
    // if all dropdowns have a value then returns the variant else returns undefined
    getSelectedVariant = () => {
        const { product, dropdownsValues } = this.state
        const { attributes, variants } = { ...product }

        return variants?.find(variant => {

            //create a counter for matches
            let matchCounts = 0
            for (let i = 0; i < variant.labels.length; i++) {
                // current label from labels array in variants
                const label = variant.labels[i]
                // get labelId and attributeId from each label object in labels array in product
                const labelId = label.label_id
                const attributeId = label.attribute_id
                // from attributes array in product, get the attribute with the same id as attributeId
                const attribute = attributes.find(({ id }) => id === attributeId)
                // search labels array in attribute and get label object with id that matches labelId
                const labelFromAttribute = attribute.labels.find(({ id }) => id === labelId)
                // if there is a match increment matchCounts
                if (labelFromAttribute.data === dropdownsValues[attributeId]) {
                    matchCounts++
                }
            }
            // if there was a match for each label object in labels send true
            // to the find function and get the current variant
            return matchCounts === variant.labels.length
        })

    }

    // checks if all dropdowns have a selected value.
    // return boolean 
    CheckAllDropdownsSelected = () => {
        const { dropdownsValues, product } = this.state
        if (dropdownsValues && product) {
            const numOfDropdownsWithValues = Object.values(dropdownsValues).filter(labelData => labelData !== '').length
            return numOfDropdownsWithValues === product.attributes.length
        }
        return false
    }


    changeQuantity = (direction) => {
        const { quantity } = this.state
        const newQuantity = direction === 'down' ? this.decrease(quantity) : this.increase(quantity)
        this.setState({ quantity: newQuantity })
    }

    increase = (quantity) => {
        if (quantity === 10) return quantity
        return ++quantity
    }

    decrease = (quantity) => {
        if (quantity === 1) return quantity
        return --quantity
    }

    //add selected dropdown values to title 
    buildUpdatedProductTitle = () => {
        const { product, dropdownsValues } = this.state
        let newTitle = product.title
        for (const attributeId in dropdownsValues) {
            if (dropdownsValues[attributeId] !== '') {
                const attribute = product.attributes.find(({ id }) => id === attributeId)
                const label = attribute.labels.find(({ data }) => data === dropdownsValues[attributeId])
                newTitle += ` ${attribute.title}: ${label.title}.`
            }
        }
        return newTitle
    }

    render() {
        const { product, primaryImg } = this.state
        const attributes = this.state.updatedAttributes
        const variant = this.getSelectedVariant()
        const isAllDropdownsSelected = this.CheckAllDropdownsSelected()
       
        if (!product) return <div></div>
        return (
            <section className="product-details">
                <div className="image-gallery">
                    {product.images?.map((img, idx) => (
                        <img
                            className={`img-${idx} gallery-child${img.title === primaryImg.title ? ' primary' : ''}`}
                            key={idx}
                            src={img.url}
                            onClick={() => this.onSelectImage(img)}
                            alt="product-img"
                        />
                    ))}
                </div>

                <div className="product-info">
                    <div className="product-title">{variant?.title || this.buildUpdatedProductTitle()}</div>
                    {variant && <div className="product-price">{`Price: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'USD' }).format(variant.price)}`}</div>}
                    {!variant && <>

                        {isAllDropdownsSelected && <div className="product-price">Out of Stock</div>}
                        {!isAllDropdownsSelected && <div className="calculate-price">(Please Select all options to calculate price)</div>}

                    </>

                    }
        
                    <p className="product-description">{product.description}</p>
                </div>

                <form className="variant-form" >
                    <div className="dropdowns-container" onSubmit={this.onClickSubmit}>
                        {attributes.map(attribute => (<TextField
                            key={attribute.id}
                            id={attribute.id}
                            fullWidth
                            select
                            label={attribute.title}
                            value={this.state.dropdownsValues[attribute.id]}
                            type={attribute.type}
                            onChange={this.handleChange(attribute.id)}
                            variant="outlined"

                        >
                            {attribute.labels.map((label) => (
                                <MenuItem key={label.id} value={label.data}>
                                    {label.title}
                                </MenuItem>
                            ))}
                        </TextField>))
                        }

                    </div>
                    <div className="quantity-select">
                        <div className="quantity-title">Quantity</div>
                        <div className="quantity-input">
                            <div className="decrease-btn" onClick={() => this.changeQuantity('down')}>-</div>
                            <div className="custom-input">{this.state.quantity}</div>
                            <div className="increase-btn" onClick={() => this.changeQuantity('up')}>+</div>
                        </div>

                    </div>

                    <div className="btn variant-form-submit-btn ">
                        <div className="Add-to-cart">Add to cart</div>
                    </div>

                </form>

            </section>
        )
    }
}