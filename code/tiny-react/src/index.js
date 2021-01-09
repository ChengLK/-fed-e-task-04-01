import TinyReact from './TinyReact'

const root = document.getElementById('root')

const virtualDOM = (
  <div className="container">
    <h1>你好 Tiny React</h1>
    <h1 data-test="test">（编码必杀技）</h1>
    <div>
      嵌套 1 <div>嵌套 1.1</div>
    </div>
    <h3>(观察：这个将会被改变)</h3>
    {2 == 1 && <div>如果 2 和 1 相等，渲染当前内容</div>}
    {2 == 2 && <div>2</div>}
    <span>这是一段内容</span>
    <button onClick={() => alert('你好')}>点击我</button>
    <h3>这个将会被删除</h3>
    2, 3
    <input type="text" value="13" />
  </div>
)

const modifyDOM = (
  <div className="container">
    <h1>你好 Tiny React</h1>
    <h1 data-test="test123">（编码必杀技）</h1>
    <div>
      嵌套 1 <div>嵌套 1.1</div>
    </div>
    <h3>(观察：这个将会被改变)</h3>
    {2 == 1 && <div>如果 2 和 1 相等，渲染当前内容</div>}
    {2 == 2 && <div>2</div>}
    <button onClick={() => alert('你好！！！')}>点击我</button>
    2, 3
    <input type="text" value="1344" />
  </div>
)

// TinyReact.render(virtualDOM, root)

// setTimeout(() => {
//   TinyReact.render(modifyDOM, root)
// }, 2000)

function Demo () {
  return <div>我是 Demo</div>
}


function Heart(props) {
  // return <div>&hearts;</div>
  // return <Demo />
  return (
    <h1>
      {props.title}
      &hearts;
      <Demo />
    </h1>
  )
}
// TinyReact.render(<Heart title="Hello React" />, root)

class Alert extends TinyReact.Component {
  constructor (props) {
    super(props)
    this.state = {
      title: 'default title'
    }
    this.handleClick = this.handleClick.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    console.log(nextProps)
  }

  componentWillUpdate () {
    console.log('componentWillUpdate')
  }

  componentDidUpdate () {
    console.log('componentDidUpdate')
  }

  handleClick () {
    this.setState({
      title: 'changed Title'
    })
  }

  render () {
    console.log(this.state)
    return (
      <div>
        <h1>{this.state.title}</h1>
        <p>I am Alert Class</p>
        <p>name is {this.props.name}</p>
        <p>age is {this.props.age}</p>
        <button onClick={this.handleClick}>改变 title</button>
      </div>
    )
  }
}

// TinyReact.render(<Alert name="张三" age={20} />, root)

// setTimeout(() => {
//   TinyReact.render(<Alert name="李四" age={50} />, root)
//   // TinyReact.render(<Heart title="我是 Heart 组件" />, root)
// }, 2000);

class DemoRef extends TinyReact.Component {

  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick () {
    console.log(this.input.value)
    console.log(this.alert)
  }

  componentDidMount () {
    console.log('componentDidMount')
  }

  componentWillUnmount () {
    console.log('componentWillUnmount')
  }
  render () {
    return (
      <div>
        <input type="text" ref={input => this.input = input} />
        <button onClick={this.handleClick}>点击</button>
        <Alert name="jal" age="23" ref={alert => this.alert = alert} />
      </div>
    )
  }
}
// TinyReact.render(<DemoRef/>, root)

class KeyDemo extends TinyReact.Component {

  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.state = {
      persons: [
        { id: 1, name: '张三' },
        { id: 2, name: '李四' },
        { id: 3, name: '王五' },
        { id: 4, name: '赵六' },
      ]
    }
  }

  handleClick () {
    const newState = JSON.parse(JSON.stringify(this.state))
    // newState.persons.push(newState.persons.shift())
    // newState.persons.splice(1, 0, { id: 100, name: '李逵' })
    newState.persons.pop()
    this.setState(newState)
  }

  render () {
    return (
      <div>
        <ul>
          {
            this.state.persons.map(person => (
              <li key={person.id}>
                {person.name}
                <DemoRef />
              </li>
            ))
          }
        </ul>
        <button onClick={this.handleClick}>点击</button>
      </div>
    )
  }
}

TinyReact.render(<KeyDemo/>, root)