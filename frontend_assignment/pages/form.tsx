import Head from "next/head"
import React, { useEffect } from "react"
import { useForm } from "react-hook-form";
import TextField from '@mui/material/TextField';

import Greeter from "artifacts/contracts/Greeters.sol/Greeters.json"
import { Contract, providers, utils } from "ethers"

import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

import styles from "../styles/Form.module.css"
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, Button, Stack } from "@mui/material";

export default function Form() {
    /* Form validation schema for user details form */
    let userSchema = yup.object({
        name: yup.string().required(),
        age: yup.number().required().positive().min(18).max(99).integer(),
        address: yup.string().required(),
        email: yup.string().required().email(),
    }).required();

    /* Creating form elements */
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(userSchema)
    });
    
    /* log data in console on formSubmit */
    const onSubmit = (data: any) => console.log(data);
      
    /* state variable to manage greeting recieved from contract */
    const [greeting, setGreeting] = React.useState("awaiting a greeting...");

    const provider = new providers.JsonRpcProvider("http://127.0.0.1:8545");
    const contract = new Contract("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", Greeter.abi, provider);

    /* Event handler for NewGreeting event */
    const attachEvent = (...args: any[]) => {
        console.log("NewGreeting event recieved");
        let _greetingVal = args[0];
        const greeting = utils.parseBytes32String(_greetingVal);
        console.log(greeting);
        setGreeting(greeting);
    };

    /* Handling NewGreeting event from contract */
    useEffect(() => {
        console.log("attaching listener for NewGreeting event.");    
        /* Attach listner for NewGreeting event */
        contract.on('NewGreeting', attachEvent);

        return () => {
            console.log("removing all listeners")
            /* Remove all listners on NewGreeting event */
            contract.removeAllListeners('NewGreeting');
        };
    }, []);

    return (
        <div className={styles.container}>
            <Head>
                <title>Form</title>
                <meta name="description" content="A simple Next.js form." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Form</h1>

                <p className={styles.description}>A simple Next.js form.</p>

                {/* "handleSubmit" will validate inputs before invoking "onSubmit" */}
                <Stack spacing={2} component="form" onSubmit={handleSubmit(onSubmit)}>
                    <TextField
                        color="info"
                        error={errors.name ? true : false}
                        id="name-input"
                        label="Name"
                        placeholder="Name"
                        helperText={errors.name?.message}
                        {...register("name" , { required: true })}
                    />

                    <FormControl error={errors.age ? true : false}>
                        <InputLabel>Age</InputLabel>
                        <Select
                            id="age-input"
                            type="number"
                            defaultValue="0"
                            label="Age"
                            {...register("age", { required: true, min: 18, max: 99 })}
                        >
                            <MenuItem disabled value="0" key="0">Select age</MenuItem>
                            {[...Array(100-18)].map((x,i) => {
                                var ageVal = 18+i;
                                return <MenuItem value={ageVal} key={ageVal}>{ageVal}</MenuItem>
                            })}
                        </Select>
                        <FormHelperText>{errors.age?.message}</FormHelperText>
                    </FormControl>

                    <TextField
                        error={errors.address ? true : false}
                        id="address-input"
                        label="Address"
                        placeholder="Address"
                        multiline
                        rows={5}
                        helperText={errors.address?.message}
                        {...register("address" , { required: true })}
                    />

                    <TextField
                        className="input"
                        error={errors.email ? true : false}
                        id="email-input"
                        label="e-mail"
                        placeholder="email"
                        helperText={errors.email?.message}
                        {...register("email" , { required: true })}
                    />

                    <Button variant="contained" type="submit"> Submit </Button>

                    <hr/>

                    <TextField
                        id="greeting"
                        label="greeting"
                        placeholder="Awaiting a greeting"
                        disabled
                        value={greeting}
                    />

                </Stack>
            </main>
        </div>
    )
}
