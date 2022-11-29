import { BiSortAlt2, BiCog } from "react-icons/bi";
import { Pool, Position, nearestUsableTick, getPool } from '@uniswap/v3-sdk'
import { ethers } from 'ethers'
import { Percent, Token, CurrencyAmount } from '@uniswap/sdk-core'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import IUniswapV3FactoryABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json';
// import { erc20ABI } from "wagmi";
// import Select, { components } from "react-select";
import networkConfig from "../utils/network_config.json";
import tokensConfig from "../utils/token_config.json";
import { useEffect, useState } from "react";
import { FetchPrice } from "../utils/common";
import HyperABI from '../contract/artifacts/contracts/Hyperswap.sol/Hyperswap.json';
//wagmi hooks
import { useAccount, useNetwork, erc20ABI } from 'wagmi'

export default function Swap() {
    const [rpc, setRpc] = useState(networkConfig[0].rpc);
    const [tokenlist, setTokenlist] = useState(tokensConfig[networkConfig[0].value]);

    //current network.
    const [currentNetwork, setCurrentNetwork] = useState(0);

    // token exchange rate
    const [rate, setRate] = useState(0);

    // pool fee 
    const [fee, setFee] = useState(500);

    //token option
    const [token0, setToken0] = useState(null);
    const [token1, setToken1] = useState(null);

    //allowance
    const [allowance, setAllowance] = useState(0);

    //token input value
    const [token0Input, setToken0Input] = useState(0);
    const [token1Input, setToken1Input] = useState(0);

    //token balance
    const [token0Balance, setToken0Balance] = useState(0);
    const [token1Balance, setToken1Balance] = useState(0);

    const provider = new ethers.providers.JsonRpcProvider(rpc);

    //deploy address: 0xA4BCB4bB1516C0F62A6CC7a60e2F6fAfd9821BD2
    //inter chain account: 0x3C951DEE860c6Da62B9D0A719B829Ed3825D1c34

    //hyper address
    const hypercontractaddress = "0xA4BCB4bB1516C0F62A6CC7a60e2F6fAfd9821BD2";
    //inter chain account address
    const interchainAccount = "0x3C951DEE860c6Da62B9D0A719B829Ed3825D1c34";

    //uniswap v3 address.
    const factoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
    const uniswapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

    //hyper options
    const hyperProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = hyperProvider.getSigner();
    const connectedContract = new ethers.Contract(hypercontractaddress, HyperABI.abi, signer);
    const { isConnected } = useAccount();
    const { chain } = useNetwork();


    // get uniswap V3 pool address 
    async function getPoolAddress(token0, token1) {
        const factoryContract = new ethers.Contract(factoryAddress, IUniswapV3FactoryABI.abi, new ethers.providers.JsonRpcProvider(networkConfig[currentNetwork].rpc));
        const ret = await factoryContract.functions.getPool(token0, token1, networkConfig[currentNetwork].fee);
        return ret.pool;
    }

    // get token0 and token1 exchange rate.
    async function getTokenExRate() {
        console.log(token0, token1);
        if (!token0 || !token1) {
            return
        }

        let token0Info = tokensConfig[networkConfig[currentNetwork].value][token0];
        let token1Info = tokensConfig[networkConfig[currentNetwork].value][token1];
        let pool = await getPoolAddress(token0Info.address, token1Info.address);
        let poolContract = new ethers.Contract(pool, IUniswapV3PoolABI.abi, provider);
        console.log("fee:", await poolContract.fee());
        setFee(await poolContract.fee());
        let tokenPrice = await FetchPrice(token0Info, token1Info, poolContract, networkConfig[currentNetwork].value);
        console.log("=================rate================", tokenPrice);
        setRate(tokenPrice);
    }

    //get balance
    async function getERC20Balance(address) {
        let erc20 = new ethers.Contract(address, erc20ABI, provider);
        let balance = await erc20.balanceOf(interchainAccount);
        return Number(balance._hex);
    }

    //get allowance
    async function getAllowance() {
        if (!token0) {
            return
        }
        //token0 address
        let chainId = networkConfig[currentNetwork].value;
        let token0Info = tokensConfig[chainId][token0];
        let erc20 = new ethers.Contract(token0Info.address, erc20ABI, provider);
        console.log("allowance================", networkConfig[currentNetwork].value, token0Info.address);
        let allowance = await erc20.allowance(interchainAccount, uniswapRouterAddress);
        console.log(token0);
        // return Number(allowance._hex);
        console.log("allowance:", Number(allowance._hex));
        setAllowance(Number(allowance._hex));
    }

    //token0 change event.
    async function selectToken0ChangeHandle(e) {
        let value = e.target.options[e.target.options.selectedIndex].getAttribute('data-key');
        if (value == token1) {
            setToken1(token0);
        }
        setToken0(value);
        // getTokenExRate();
        await getAllowance();
    }

    //token1 change event.
    async function selectToken1ChangeHandle(e) {
        let value = e.target.options[e.target.options.selectedIndex].getAttribute('data-key');
        if (value == token0) {
            setToken0(token1);
        }
        setToken1(value);
        // getTokenExRate();
        await getAllowance();
    }

    function token0InputHandle(e) {
        setToken0Input(e.target.value);
        //set estimate token1
        if (token1 && rate > 0 && e.target.value > 0) {
            setToken1Input(e.target.value / rate);
        }
    }

    function token1InputHandle(e) {
        setToken1Input(e.target.value);
        //set estimate token0
        if (token0 && rate > 0 && e.target.value > 0) {
            setToken0Input(e.target.value * rate);
        }
    }

    // approve
    async function approve() {
        console.log("==================approve================");
        if (!isConnected) {
            alert("please connect wallet!!");
            return;
        }
        if (chain.id != 80001) {
            alert("please use mumbai net!!");
            return;
        }

        const m = await connectedContract.ApproveSpecifyToken(networkConfig[currentNetwork].value, tokensConfig[networkConfig[currentNetwork].value][token0].address, ethers.utils.parseEther(token0Input), {
            gasLimit: ethers.utils.hexlify(0x100000), //100000
        });
        console.log(m);

    }

    async function swap() {
        console.log("=================swap===================");
        if (!isConnected) {
            alert("please connect wallet!!");
            return;
        }

        if (chain.id != 80001) {
            alert("please use mumbai net!!");
            return;
        }
        console.log("swap:", token0Input);

        const m = await connectedContract.HyperlaneSwap(networkConfig[currentNetwork].value, [tokensConfig[networkConfig[currentNetwork].value][token0].address, tokensConfig[networkConfig[currentNetwork].value][token1].address], fee, ethers.utils.parseEther('0.00001'), 0, {
            gasLimit: ethers.utils.hexlify(0x100000), //100000
        });
        console.log(m);
    }

    function buttonHtml() {
        if (token0Input > token0Balance) {
            return <button className="btn btn-primary w-full normal-case my-5 rounded-xl" disabled>Insufficient balance</button>
        }

        //check allowance.
        if (token0Input > allowance) {
            return <button className="btn btn-primary w-full normal-case my-5 rounded-xl" onClick={approve}>Approve</button>
        }

        if (token1Input > 0 && token0Input > 0 && token1Input && token0 && token1) {
            return <button className="btn btn-primary w-full normal-case my-5 rounded-xl" onClick={swap}>Swap</button>
        }

        return <button className="btn btn-primary w-full normal-case my-5 rounded-xl">Enter an amount</button>
    }

    //switch network
    const networkChange = (e) => {
        let netKey = e.target.value;
        let ChainId = networkConfig[netKey].value;
        setRpc(networkConfig[netKey].rpc);
        console.log("=============switch network===========", networkConfig[netKey].rpc);
        setTokenlist(tokensConfig[ChainId]);
        setCurrentNetwork(netKey);
        //unset token
        setToken0(null);
        setToken1(null);
        //unset amount
        setToken0Input(0);
        setToken1Input(0);
    }

    useEffect(() => {
        console.log("================counting balance=================");

        const fetchToken0Balance = async () => {
            let token0Info = tokensConfig[networkConfig[currentNetwork].value][token0];
            let token0Balance = await getERC20Balance(token0Info.address);
            console.log(ethers.utils.formatUnits(token0Balance, 18));
            setToken0Balance(ethers.utils.formatUnits(token0Balance, 18));
        }

        const fetchToken1Balance = async () => {
            let token1Info = tokensConfig[networkConfig[currentNetwork].value][token1];
            let token1Balance = await getERC20Balance(token1Info.address);
            console.log(ethers.utils.formatUnits(token1Balance, 18));
            setToken1Balance(ethers.utils.formatUnits(token1Balance, 18));
        }

        if (token0) {
            fetchToken0Balance();
        }
        if (token1) {
            fetchToken1Balance();
        }

        //caculate token ex rate.
        getTokenExRate();

    }, [token0, token1])

    return (
        <div className="">

            <div className="w-32 mx-auto mt-40">
                <select className="select w-full max-w-xs rounded-2xl select-primary bg-slate-50" onChange={networkChange}>

                    {networkConfig.map((item, key) => (
                        <option key={key} value={key}>{item.label}</option>
                    ))}

                </select>
            </div>

            <div className="w-1/4 min-w-max h-auto mt-10 border-solid border-2 rounded-2xl m-auto p-1 font-mono text-sm bg-slate-50">

                <div className="w-full px-6 py-4">
                    <span className="font-black">
                        UniSwap V3
                    </span>
                    <BiCog className="cursor-pointer float-right" size="1.5rem" />
                </div>

                <div className="flex flex-col px-5 py-2">
                    <div className="h-24 border-solid border-2 rounded-2xl my-5 p-2">
                        <span className="font-black">
                            From
                        </span>
                        <div className="px-2 float-right">
                            Balance:{token0Balance}
                        </div>
                        <div className="flex flex-row p-2 gap-x-32">
                            <div className="w-1/2">
                                <input type="text" placeholder="0.0" onChange={token0InputHandle} onFocus={token0InputHandle} value={token0Input} className="input input-ghost w-full max-w-xs focus:outline-0 focus:bg-inherit" />
                            </div>
                            <div className="w-1/4">
                                <select className="select select-primary w-full max-w-xs rounded-2xl bg-slate-50" onChange={selectToken0ChangeHandle}>
                                    <option disabled selected>Pick</option>
                                    {tokenlist.map((item, key) => (
                                        (key == token0) ? <option key={key} data-key={key} selected value={item.address}>{item.symbol}</option> : <option key={key} data-key={key} value={item.address}>{item.symbol}</option>
                                    ))}

                                </select>
                            </div>
                        </div>

                    </div>
                    <div className="m-auto">
                        <BiSortAlt2 className="cursor-pointer" size="1.4rem" />
                    </div>
                    <div className="h-24 border-solid border-2 rounded-2xl my-5 p-2">
                        <span className="font-black">
                            To
                        </span>
                        <div className="px-2 float-right">
                            Balance:{token1Balance}
                        </div>
                        <div className="flex flex-row p-2 gap-x-32">
                            <div className="w-1/2">
                                <input type="text" placeholder="0.0" onChange={token1InputHandle} onFocus={token1InputHandle} value={token1Input} className="input input-ghost w-full max-w-xs focus:outline-0 focus:bg-inherit" />
                            </div>
                            <div className="w-1/4">
                                <select className="select select-primary w-full max-w-xs rounded-2xl bg-slate-50" onChange={selectToken1ChangeHandle}>
                                    <option disabled selected>Pick</option>
                                    {tokenlist.map((item, key) => (
                                        (key == token1) ? <option key={key} data-key={key} selected value={item.address}>{item.symbol}</option> : <option key={key} data-key={key} value={item.address}>{item.symbol}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div>
                        {buttonHtml()}
                    </div>
                </div>

            </div>
        </div >
    )
}