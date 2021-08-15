import React, { Component } from "react";
import { productService } from '../services/productService.js'
import { ProductList } from '../cmps/ProductList.jsx'

export class Home extends Component {

    state = {}

    componentDidMount() {
        this.loadProducts()
    }

    loadProducts = async () => {
        const products = await productService.getProducts();
        this.setState({ products })
    }
    
    render() {
        const { products } = this.state
        if (!products) return <div></div>
        return (
            <section className="home">
                <div className="home-header">
                    <div className="rectangle">
                        <h1 className="home-title products">products</h1>
                    </div>
                </div>
                <ProductList products={products} />
            </section>
        )
    }
}



