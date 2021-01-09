import React, { render, Component } from './react'

const root = document.getElementById('root')

const jsx = (
  <div>
    <p>Hello React</p>
    <p>Hi Fiber</p>
  </div>
)

// render(jsx, root)

// setTimeout(() => {
//   const jsx = (
//     <div>
//       <p>Hi Fiber</p>
//     </div>
//   )
  
//   render(jsx, root)
// }, 2000);

class Greating extends Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '计爱玲'
    }
  }
  render () {
    return (
      <div>
        <h1>{this.props.title}， {this.state.name}</h1>
        <button onClick={() => this.setState({name: '王一博'})}>修改</button>
      </div>
    )
  }
}

render(<Greating title="I Love You" />, root)

function FnComponent (props) {
  return <div> {props.title} FnComponent</div>
}

// render(<FnComponent title="hello" />, root)