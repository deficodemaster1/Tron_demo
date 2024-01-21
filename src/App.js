

import { useCallback,useState,useMemo,useEffect } from 'react';

import { TronLinkAdapter,WalletConnectAdapter,LedgerAdapter,BitKeepAdapter, OkxWalletAdapter, TokenPocketAdapter, } from '@tronweb3/tronwallet-adapters';
import { WalletModalProvider, WalletActionButton,WalletConnectButton,WalletSelectButton,Button } from '@tronweb3/tronwallet-adapter-react-ui';
import { WalletProvider, useWallet } from '@tronweb3/tronwallet-adapter-react-hooks';
import abi from './trc20.json'
function SignDemo() {
    const { signMessage, signTransaction, address } = useWallet();
    const [message, setMessage] = useState('hello');
    const [amount, setAmount] = useState(100000000);
    const [signedMessage, setSignedMessage] = useState('');
    const [TrxBalance, setTrxBalance] = useState('-');
    const [TokenBalance, setTokenBalance] = useState('-');
    const receiver = 'TMDKznuDWaZwfZHcM61FVFstyYNmK6Njk1';

    // 获取钱包trx余额
    async function getBalance()  {
        //当前连接的钱包地址获取 window.tronWeb.defaultAddress.base58
        const balance = await window.tronWeb.trx.getBalance(address);
        setTrxBalance(balance)
    }

    // 获取钱包trc20代币余额 call方法
    async function getTokenBalance()  {
        //当前连接的钱包地址获取 window.tronWeb.defaultAddress.base58
        const USDT_ADDRESS = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
        const contract = await window.tronWeb.contract(abi, USDT_ADDRESS);
        const result = await contract.balanceOf(address).call();
        // result is big number
        const balance = await window.tronWeb.trx.getBalance(address);
        setTokenBalance(balance)
    }

    // trc20 代币转账操作  send方法
    async function sendToken()  {
        try {
          //当前连接的钱包地址获取 window.tronWeb.defaultAddress.base58
          const receiver = 'TACAJTXR6k4SaSoYTejPEwFW1zkMXLWCVe';
          const USDT_ADDRESS = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
          const contract = await window.tronWeb.contract(abi, USDT_ADDRESS);
          const txID = await contract.transfer(receiver, amount).send();
          // result is big number
        } catch (error){
          console.log(error)
        }
    }

    // 钱包签名
    async function onSignMessage() {
        const res = await signMessage(message);
        setSignedMessage(res);
    }

    // 转账操作
    async function onSignTransaction() {
      try {
        const transaction = await window.tronWeb.transactionBuilder.sendTrx(receiver, window.tronWeb.toSun(0.001), address);
        const signedTransaction = await signTransaction(transaction);
        // const signedTransaction = await tronWeb.trx.sign(transaction);
        await window.tronWeb.trx.sendRawTransaction(signedTransaction);
      } catch (error){
        console.log(error)
      }
    }

    return (
        <div style={{ marginBottom: 200 }}>
            <h2>Sign a message</h2>
            <p style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', wordBreak: 'break-all' }}>
                You can sign a message by click the button.
            </p>
            <Button style={{ marginRight: '20px' }} onClick={onSignMessage}>
                SignMessage
            </Button>
            <p>Your sigedMessage is: {signedMessage}</p>
            <h2>Sign a Transaction</h2>
            <p style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', wordBreak: 'break-all' }}>
                You can transfer 0.001 Trx to &nbsp;<i>{receiver}</i>&nbsp;by click the button.
            </p>
            <Button onClick={onSignTransaction}>Transfer</Button>

            <h2>Trx Balance </h2>
            <p>Your TRX Balance is: {TrxBalance}</p>
            <Button onClick={getBalance}>Get TRX Balance</Button>

            <h2>合约交互 Call</h2>
            <p>Your USDT Balance is: {TokenBalance}</p>
            <Button onClick={getTokenBalance}>Get USDT Balance</Button>

            <h2>合约交互 Send</h2>
            <p>transfer <input placeholder='transfer amount' onChange={e => {setAmount(e.target.value* 1000000)}} type="text"/> trx20 token usdt</p>
            <Button onClick={sendToken}>Send USDT</Button>

        </div>
    );
}

function App() {
    const { address, wallet, connected, select, connect, disconnect, signMessage, signTransaction } = useWallet();
    const [readyState, setReadyState] = useState('');
    const [account, setAccount] = useState('');
    const [netwok, setNetwork] = useState({});
    const [signedMessage, setSignedMessage] = useState('');
    const adapters = useMemo(() => {
        const tronLinkAdapter = new TronLinkAdapter();
        const walletConnectAdapter = new WalletConnectAdapter({
              network: 'Nile',
              options: {
                  relayUrl: 'wss://relay.walletconnect.com',
                  // example WC app project ID
                  projectId: '5fc507d8fc7ae913fff0b8071c7df231',
                  metadata: {
                      name: 'Test DApp',
                      description: 'JustLend WalletConnect',
                      url: 'https://your-dapp-url.org/',
                      icons: ['https://your-dapp-url.org/mainLogo.svg'],
                  },
              },
              web3ModalConfig: {
                  themeMode: 'dark',
                  themeVariables: {
                      '--w3m-z-index': '1000'
                  },
              }
            });
        const ledger = new LedgerAdapter({
            accountNumber: 2,
        });
        const bitKeepAdapter = new BitKeepAdapter();
        const tokenPocketAdapter = new TokenPocketAdapter();
        const okxwalletAdapter = new OkxWalletAdapter();
        return [tronLinkAdapter,walletConnectAdapter, ledger,bitKeepAdapter,tokenPocketAdapter,okxwalletAdapter];
    }, []);

    const onError = useCallback((e) => {
        // handle error here
    }, []);


    return (
      <WalletProvider onError={onError} autoConnect={true} disableAutoConnectOnLoad={true} adapters={adapters}>
          <WalletModalProvider>
              <WalletActionButton></WalletActionButton>
              <SignDemo></SignDemo>
          </WalletModalProvider>
      </WalletProvider>
    );
}


export default App;
