// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-core/contracts/libraries/LowGasSafeMath.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Call.sol";

/**
 * @dev Hyperlane interchainaccount router.
 */
interface IInterchainAccountRouter {
    function dispatch(
        uint32 _destinationDomain,
        Call[] calldata calls
    ) external;

    function getInterchainAccount(
        uint32 _originDomain, 
        address _sender
    ) external view returns (address);
}

/**
 * @dev https://www.hyperlane.xyz/
 *
 * This version should only be deployed on child chain to process cross-chain
 * messages originating from the parent chain.
 *
 * token swap using hyperlane acocunt API for gitcoin hackathon.
 */
contract Hyperswap {
    //local deploy chain id.
    uint32 public _localDomain;

    //account api router address.
    IInterchainAccountRouter constant routerAccount = IInterchainAccountRouter(0x28DB114018576cF6c9A523C17903455A161d18C4);

    //Uniswap v3 Router Address.
    address private constant SWAP_ROUTER = 0xE592427A0AEce92De3Edee1F18E0157C05861564;

    /// constructor
    /// @notice 
    /// @param localDomain local chain id
    constructor(uint32 localDomain){
        _localDomain = localDomain;
    }

   /// Hyperlane interchainaccount,get accout by chainID
   /// @notice
   /// @param localDomain local chain id
    function InterChainAccount(uint32 localDomain) public view returns (address) {
       address myAccount = routerAccount.getInterchainAccount(
            localDomain,
            address(this)
        );

        return myAccount;
    }

    /// Approve specify ERC20 token
    /// @notice Approve specify ERC20 token
    /// @param _destinationDomain remote chain id
    /// @param tokenIn erc20 token address
    /// @param amountIn erc20 approve amount
    function ApproveSpecifyToken(uint32 _destinationDomain,address tokenIn,uint256 amountIn) public{
        Call[] memory call = new Call[](1);

        call[0] = Call({
            to:address(tokenIn),
            data:abi.encodeCall(IERC20.approve,(address(SWAP_ROUTER), amountIn))
        });

        routerAccount.dispatch(
            _destinationDomain,
            call
        );
    }

    /// Swap token via hyperlane account api
    /// @notice Approve specify ERC20 token
    /// @param _destinationDomain remote chain id
    /// @param path from address to address.
    /// @param fee exchange fee 
    /// @param amountIn amount in amount
    /// @param amountOutMin min amountOut amount 
    function HyperlaneSwap(
        uint32 _destinationDomain,
        address[] calldata path,
        uint24 fee,
        uint256 amountIn,
        uint256 amountOutMin
        ) external payable {
        //init uniswap address interface.
        ISwapRouter router = ISwapRouter(SWAP_ROUTER);

        // Fee possibilities: 500, 3000, 10000
        ISwapRouter.ExactInputSingleParams memory inputParams = ISwapRouter.ExactInputSingleParams({
            tokenIn:path[0],
            tokenOut:path[1],
            fee: fee,
            recipient: InterChainAccount(_localDomain),
            deadline: block.timestamp+600,
            amountIn: amountIn,
            amountOutMinimum: amountOutMin,
            sqrtPriceLimitX96: 0
        });

        Call[] memory call = new Call[](1);

        call[0] = Call({
            to: SWAP_ROUTER,
            data: abi.encodeCall(router.exactInputSingle, inputParams)
        });

        routerAccount.dispatch(
            _destinationDomain,
            call
        );
    }
}   