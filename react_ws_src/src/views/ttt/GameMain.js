import React, {Component} from 'react'

import io from 'socket.io-client'

import TweenMax from 'gsap'

import rand_arr_elem from '../../helpers/rand_arr_elem'
import rand_to_fro from '../../helpers/rand_to_fro'

export default class SetName extends Component {

	constructor (props) {
		super(props)

		this.win_sets = [
			['c1', 'c2', 'c3'],
			['c4', 'c5', 'c6'],
			['c7', 'c8', 'c9'],

			['c1', 'c4', 'c7'],
			['c2', 'c5', 'c8'],
			['c3', 'c6', 'c9'],

			['c1', 'c5', 'c9'],
			['c3', 'c5', 'c7']
		]


		if (this.props.game_type != 'live')
			this.state = {
				cell_vals: {},
				next_turn_ply: true,
				game_play: true,
				i_play_first: true,
				game_stat: 'Start game',
				you_win: 0,
				opponent_win: 0
			}
		else {
			this.sock_start()

			this.state = {
				cell_vals: {},
				next_turn_ply: true,
				game_play: 'Connecting',
				game_stat: 'Connecting',
				you_win: 0,
				opponent_win: 0
			}
		}
	}

//	------------------------	------------------------	------------------------

	componentDidMount () {
    	TweenMax.from('#game_stat', 1, {display: 'none', opacity: 0, scaleX:0, scaleY:0, ease: Power4.easeIn})
    	TweenMax.from('#game_board', 1, {display: 'none', opacity: 0, x:-200, y:-200, scaleX:0, scaleY:0, ease: Power4.easeIn})
	}

//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	sock_start () {

		this.socket = io(app.settings.ws_conf.loc.SOCKET__io.u);

		this.socket.on('connect', function(data) { 
			// console.log('socket connected', data)

			this.socket.emit('new player', { name: app.settings.curr_user.name });

		}.bind(this));

		this.socket.on('pair_players', function(data) { 
			// console.log('paired with ', data)

			this.setState({
				next_turn_ply: data.mode=='m',
				i_play_first: data.mode=='m',
				game_play: true,
				game_stat: 'Playing with ' + data.opp.name
			})

		}.bind(this));


		this.socket.on('opp_turn', this.turn_opp_live.bind(this));

		this.socket.on('restartGame', this.restart.bind(this));



	}

//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	componentWillUnmount () {

		this.socket && this.socket.disconnect();
	}

//	------------------------	------------------------	------------------------

	cell_cont (c) {
		const { cell_vals } = this.state

		return (<div>
		        	{cell_vals && cell_vals[c]=='x' && <i className="fa fa-times fa-5x"></i>}
					{cell_vals && cell_vals[c]=='o' && <i className="fa fa-circle-o fa-5x"></i>}
				</div>)
	}

//	------------------------	------------------------	------------------------

	render () {
		const { cell_vals } = this.state
		// console.log(cell_vals)

		return (
			<div id='GameMain'>

				<h3>You're playing against {this.props.game_type} {this.props.game_type === 'comp' && `in ${this.props.game_difficulty}`}</h3>

				<div id="game_stat" style={{marginTop: '20px'}}>
					<div id="game_stat_msg">{this.state.game_stat}</div>
					<div id="game_turn_msg">{this.state.game_play ? this.state.game_play === 'Connecting' ? '. . .' : this.state.next_turn_ply ? 'Your turn' : 'Opponent turn' : 'Play again'}</div>
				</div>
				
				<div className="row" style={{margin: '20px 0 20px 0'}}>
					<div className="col-4-sm">Score</div>
					<div className="col-4-sm">You ({this.state.you_win})</div>
					<div className="col-4-sm">Opponent ({this.state.opponent_win})</div>
				</div>

				<div className="row">
					<div className="col-8">
						<div id="game_board">
							<table>
							<tbody>
								<tr>
									<td id='game_board-c1' ref='c1' onClick={this.click_cell.bind(this)}> {this.cell_cont('c1')} </td>
									<td id='game_board-c2' ref='c2' onClick={this.click_cell.bind(this)} className="vbrd"> {this.cell_cont('c2')} </td>
									<td id='game_board-c3' ref='c3' onClick={this.click_cell.bind(this)}> {this.cell_cont('c3')} </td>
								</tr>
								<tr>
									<td id='game_board-c4' ref='c4' onClick={this.click_cell.bind(this)} className="hbrd"> {this.cell_cont('c4')} </td>
									<td id='game_board-c5' ref='c5' onClick={this.click_cell.bind(this)} className="vbrd hbrd"> {this.cell_cont('c5')} </td>
									<td id='game_board-c6' ref='c6' onClick={this.click_cell.bind(this)} className="hbrd"> {this.cell_cont('c6')} </td>
								</tr>
								<tr>
									<td id='game_board-c7' ref='c7' onClick={this.click_cell.bind(this)}> {this.cell_cont('c7')} </td>
									<td id='game_board-c8' ref='c8' onClick={this.click_cell.bind(this)} className="vbrd"> {this.cell_cont('c8')} </td>
									<td id='game_board-c9' ref='c9' onClick={this.click_cell.bind(this)}> {this.cell_cont('c9')} </td>
								</tr>
							</tbody>
							</table>
						</div>
					</div>
					<div className="col-4">
						<button style={{marginTop: 0, marginBottom: 30}} type='submit' onClick={this.end_game.bind(this)} className='button'><span>End Game <span className='fa fa-caret-right'></span></span></button>
						<button style={{marginTop: 0}} onClick={this.restart_game.bind(this)} className='button'><span>Restart Game <span className='fa fa-caret-right'></span></span></button>
					</div>
				</div>

			</div>
		)
	}

//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	click_cell (e) {
		// console.log(e.currentTarget.id.substr(11))
		// console.log(e.currentTarget)

		if (!this.state.next_turn_ply || !this.state.game_play) return

		const cell_id = e.currentTarget.id.substr(11)
		if (this.state.cell_vals[cell_id]) return

		if (this.props.game_type != 'live')
			this.turn_ply_comp(cell_id)
		else
			this.turn_ply_live(cell_id)
	}

//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	turn_ply_comp (cell_id) {

		let { cell_vals } = this.state

		cell_vals[cell_id] = 'x'

		TweenMax.from(this.refs[cell_id], 0.7, {opacity: 0, scaleX:0, scaleY:0, ease: Power4.easeOut})


		// this.setState({
		// 	cell_vals: cell_vals,
		// 	next_turn_ply: false
		// })

		// setTimeout(this.turn_comp.bind(this), rand_to_fro(500, 1000));

		this.state.cell_vals = cell_vals

		this.check_turn()
	}

//	------------------------	------------------------	------------------------

	turn_comp () {

		let { cell_vals } = this.state
		let empty_cells_arr = []


		for (let i=1; i<=9; i++) 
			!cell_vals['c'+i] && empty_cells_arr.push('c'+i)
		// console.log(cell_vals, empty_cells_arr, rand_arr_elem(empty_cells_arr))

		// Pick computer move based on difficulty level
		const c = this.props.game_difficulty === 'easy' ? rand_arr_elem(empty_cells_arr) : `c${this.bestSquare()}`;
		cell_vals[c] = 'o'

		TweenMax.from(this.refs[c], 0.7, {opacity: 0, scaleX:0, scaleY:0, ease: Power4.easeOut})


		// this.setState({
		// 	cell_vals: cell_vals,
		// 	next_turn_ply: true
		// })

		this.state.cell_vals = cell_vals

		this.check_turn()
	}


//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	turn_ply_live (cell_id) {

		let { cell_vals } = this.state

		cell_vals[cell_id] = 'x'

		TweenMax.from(this.refs[cell_id], 0.7, {opacity: 0, scaleX:0, scaleY:0, ease: Power4.easeOut})

		this.socket.emit('ply_turn', { cell_id: cell_id });

		// this.setState({
		// 	cell_vals: cell_vals,
		// 	next_turn_ply: false
		// })

		// setTimeout(this.turn_comp.bind(this), rand_to_fro(500, 1000));

		this.state.cell_vals = cell_vals

		this.check_turn()
	}

//	------------------------	------------------------	------------------------

	turn_opp_live (data) {

		let { cell_vals } = this.state
		let empty_cells_arr = []


		const c = data.cell_id
		cell_vals[c] = 'o'

		TweenMax.from(this.refs[c], 0.7, {opacity: 0, scaleX:0, scaleY:0, ease: Power4.easeOut})


		// this.setState({
		// 	cell_vals: cell_vals,
		// 	next_turn_ply: true
		// })

		this.state.cell_vals = cell_vals

		this.check_turn()
	}

//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	check_turn () {

		const { cell_vals } = this.state

		let win = false
		let set
		let fin = true

		if (this.props.game_type!='live')
			this.state.game_stat = 'Play'


		for (let i=0; !win && i<this.win_sets.length; i++) {
			set = this.win_sets[i]
			if (cell_vals[set[0]] && cell_vals[set[0]]==cell_vals[set[1]] && cell_vals[set[0]]==cell_vals[set[2]])
				win = true
		}


		for (let i=1; i<=9; i++) 
			!cell_vals['c'+i] && (fin = false)

		// win && console.log('win set: ', set)

		if (win) {
		
			this.refs[set[0]].classList.add('win')
			this.refs[set[1]].classList.add('win')
			this.refs[set[2]].classList.add('win')

			TweenMax.killAll(true)
			TweenMax.from('td.win', 1, {opacity: 0, ease: Linear.easeIn})

			if(cell_vals[set[0]]==='x'){
				this.setState({
					you_win: this.state.you_win+1,
					game_stat: 'You win 💪',
					game_play: false
				})
			}
			else{
				this.setState({
					opponent_win: this.state.opponent_win+1,
					game_stat: 'Opponent wins 😫',
					game_play: false
				})
			}

		} else if (fin) {
		
			this.setState({
				game_stat: 'Draw',
				game_play: false
			})

			this.socket && this.socket.disconnect();

		} else {
			this.props.game_type!='live' && this.state.next_turn_ply && setTimeout(this.turn_comp.bind(this), rand_to_fro(500, 1000));

			this.setState({
				next_turn_ply: !this.state.next_turn_ply
			})
		}
		
	}

//	------------------------	------------------------	------------------------

	end_game () {
		this.socket && this.socket.disconnect();

		this.props.onEndGame()
	}

	restart() {
		this.setState({
			cell_vals: {},
			next_turn_ply: this.state.i_play_first,
			game_play: true
		});

		document.querySelectorAll('td.win').forEach((l) => l.classList.remove('win'));
	}

	restart_game() {
		this.restart();

		this.props.game_type === 'live' && this.socket.emit('restart', { cell_id: null });

	}

	hasWinner() {

		let { cell_vals } = this.state;

		const lines = [
			[1, 2, 3],
			[4, 5, 6],
			[7, 8, 9],
			[1, 4, 7],
			[2, 5, 8],
			[3, 6, 9],
			[1, 5, 9],
			[3, 5, 7]
		];
		for (let i = 0; i < lines.length; i++) {
			const [a, b, c] = lines[i];
			if (cell_vals[`c${a}`] && cell_vals[`c${a}`] === cell_vals[`c${b}`] && cell_vals[`c${a}`] === cell_vals[`c${c}`]) {
				return cell_vals[`c${a}`];
			}
		}
		return null;
	}

	hasEmptyCells (cell_vals) {
		for (let i = 1; i <= 9; i++) {
		  	if (!cell_vals[`c${i}`]) {
				return true;
		  	}
		}
		return false;
	}

	bestSquare() {
		const player = 'x';
		const opponent = 'o';
		let { cell_vals } = this.state;
	
		const minimax = (squares, isMax) => {
			// Checking for winner before optimising
			const winner = this.hasWinner(squares);
			if (winner === player) return { square: -1, score: 1 };
			if (winner === opponent) return { square: -1, score: -1 };
			// Tie
			if (!this.hasEmptyCells(squares)) return { square: -1, score: 0 };
			// 
			// 
			// 
			// Begin Min-Max
			const best = { square: -1, score: isMax ? -1000 : 1000 };
			for (let i = 1; i <= 9; i++) {
				if (squares[`c${i}`]) {
					continue;
				}
				squares[`c${i}`] = isMax ? player : opponent;
				// Simulate all outcomes
				const score = minimax(squares, !isMax).score;
				squares[`c${i}`] = null;
	
				if (isMax) {
					if (score > best.score) {
						best.score = score;
						best.square = i;
					}
				} else {
					if (score < best.score) {
						best.score = score;
						best.square = i;
					}
				}
			}
	
			return best;
		};
	
		return minimax(cell_vals, false).square;
	}



}
