// Import Solana web3 functionalities
const {
	Connection,
	PublicKey,
	clusterApiUrl,
	Keypair,
	LAMPORTS_PER_SOL,
	Transaction,
	SystemProgram,
	sendAndConfirmTransaction,
} = require("@solana/web3.js");

const transferSol = async () => {
	const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

	// Generate a new keypair
	const from = Keypair.generate();

	// Generate another Keypair (account we'll be sending to)
	const to = Keypair.generate();

	// Airdrop 2 SOL to Sender wallet
	console.log("Airdropping some SOL to Sender wallet!");
	const fromAirDropSignature = await connection.requestAirdrop(
		new PublicKey(from.publicKey),
		2 * LAMPORTS_PER_SOL,
	);

	// Latest blockhash (unique identifier of the block) of the cluster
	let latestBlockHash = await connection.getLatestBlockhash();

	// Confirm transaction using the last valid block height (refers to its time)
	// to check for transaction expiration
	await connection.confirmTransaction({
		blockhash: latestBlockHash.blockhash,
		lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
		signature: fromAirDropSignature,
	});

	console.log("Airdrop completed for the Sender account");

	// Calculate the balance of the sender wallet
	let balance = await connection.getBalance(from.publicKey);
	console.log(`Sender wallet balance: ${balance / LAMPORTS_PER_SOL} SOL`);

	// Calculate 50% of the balance
	let transferAmount = balance / 2;

	// Send 50% of the balance from "from" wallet to "to" wallet
	var transaction = new Transaction().add(
		SystemProgram.transfer({
			fromPubkey: from.publicKey,
			toPubkey: to.publicKey,
			lamports: transferAmount,
		}),
	);

	// Sign transaction
	var signature = await sendAndConfirmTransaction(connection, transaction, [
		from,
	]);
	console.log("Signature is", signature);
	console.log(
		`Transferred ${
			transferAmount / LAMPORTS_PER_SOL
		} SOL to the recipient wallet`,
	);
};

transferSol();
