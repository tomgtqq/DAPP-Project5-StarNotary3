pragma solidity >=0.4.24;

//Importing openzeppelin-solidity ERC-721 implemented Standard
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

// StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation
contract StarNotary is ERC721 {

    // Star data
    struct Star {
        string name;
    }

    // Implement Task 1 Add a name and symbol properties
    // name: Is a short name to your token
    // symbol: Is a short string like 'USD' -> 'American Dollar'

    /**
     * @dev extand from Metadata.sol is another way.
     */

     string private _name; // token name
     string private _symbol; // token symbol

     constructor (string memory tokenName, string memory symbol) public {
       _name = tokenName;
       _symbol = symbol;
     }

     /**
     * @return the name of the token.
     */
     function name() public view returns (string memory) {
       return _name;
     }

     /**
      * @return the symbol of the token.
      */
     function symbol() public view returns (string memory) {
       return _symbol;
     }

    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;


    // Create Star using the Struct
    function createStar(string memory _starName, uint256 _tokenId) public { // Passing the name and tokenId as a parameters
        Star memory newStar = Star(_starName); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't owned");
        starsForSale[_tokenId] = _price;
    }


    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }

    function buyStar(uint256 _tokenId) public  payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value >= starCost, "You need to have enough Ether");
        _transferFrom(ownerAddress, msg.sender, _tokenId); // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom
        address payable ownerAddressPayable = _make_payable(ownerAddress); // We need to make this conversion to be able to use transfer() function to transfer ethers
        ownerAddressPayable.transfer(starCost);
        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    // Implement Task 1 lookUptokenIdToStarInfo
    function lookUptokenIdToStarInfo (uint _tokenId) public view returns (string memory starName, address ownerAddress ,uint256 starPrice) {
        //1. You should return the Star saved in tokenIdToStarInfo mapping
        Star memory _star = tokenIdToStarInfo[_tokenId];
        starName = _star.name;
        ownerAddress = ownerOf(_tokenId);
        starPrice = starsForSale[_tokenId];
    }

    // Implement Task 1 Exchange Stars function
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        //1. Passing to star tokenId you will need to check if the owner of _tokenId1 or _tokenId2 is the sender
        //2. You don't have to check for the price of the token (star)
        //3. Get the owner of the two tokens (ownerOf(_tokenId1), ownerOf(_tokenId1)
        //4. Use _transferFrom function to exchange the tokens.
        require(starsForSale[_tokenId1] > 0 && starsForSale[_tokenId2] > 0 ,"Only star for selling can exchange");
        address  owner1Address = ownerOf(_tokenId1);
        address  owner2Address = ownerOf(_tokenId2);
        require(msg.sender == owner1Address||msg.sender == owner2Address ,"Only star owner can exchange star");
        _transferFrom(owner1Address, owner2Address, _tokenId1);
        _transferFrom(owner2Address, owner1Address, _tokenId2);
    }

    // Implement Task 1 Transfer Stars
    function transferStar(address _to1, uint256 _tokenId) public {
        //1. Check if the sender is the ownerOf(_tokenId)
        //2. Use the transferFrom(from, to, tokenId); function to transfer the Star
        address ownerAddress = ownerOf(_tokenId);
        require(msg.sender == ownerAddress, "Only Star's owner can transfer this Star");
        _transferFrom(ownerAddress, _to1, _tokenId);
    }

}
