const { useState, useCallback } = React;

function App() {
    const [count, setCount] = useState(0);
    const onClick = useCallback(() => setCount(count + 1), [count]);
    return <button onClick={onClick}>You've clicked {count} times!</button>;
}

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")
);
