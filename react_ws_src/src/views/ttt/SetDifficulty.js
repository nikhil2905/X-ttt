import React, {Component} from 'react'

export default class SetDifficulty extends Component {

	constructor (props) {
		super(props)

		this.state = {}
	}

//	------------------------	------------------------	------------------------

	render () {
		return (
			<div id='SetDifficulty'>

				<h1>Choose Difficulty</h1>

				<button type='submit' onClick={this.selDiffEasy.bind(this)} className='button long'><span>Easy <span className='fa fa-caret-right'></span></span></button>
				
				&nbsp;&nbsp;&nbsp;&nbsp;

				<button type='submit' onClick={this.selDiffGod.bind(this)} className='button long'><span>Godlike <span className='fa fa-caret-right'></span></span></button>

			</div>
		)
	}

	selDiffEasy (e) {
		// const { name } = this.refs
		// const { onSetType } = this.props
		// onSetType(name.value.trim())

		this.props.onSetDifficulty('easy');
	}

	selDiffGod (e) {
		// const { name } = this.refs
		// const { onSetType } = this.props
		// onSetType(name.value.trim())

		this.props.onSetDifficulty('godmode');
	}

}
