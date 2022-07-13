import React, {Component} from 'react'

export default class MainContent extends Component {

	constructor (props) {
		super(props);
		this.state = {
			winWidth: window.innerWidth
		}
	}

	componentDidMount() {
		window.addEventListener('resize', ()=>{this.setState({ winWidth: window.innerWidth })});
	}

	render () {
		return (
			<section id='main_content' className={`${this.state.winWidth < 720 ? 'small' : 'big'}`}>
				<div className='main_container'>
					{this.props.children}
				</div>
			</section>
		)
	}
}

MainContent.propTypes = {
	children: React.PropTypes.any
}
