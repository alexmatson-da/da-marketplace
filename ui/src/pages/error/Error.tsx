import React from 'react';
import { Button, Grid, Paper, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import useStyles from './styles';
import loginLogo from '../../images/companyLogo.svg';

export default function Error() {
  var classes = useStyles();

  return (
    <Grid container className={classes.container}>
      <div className={classes.logotype}>
        <img className={classes.logotypeIcon} src={loginLogo} alt="logo" />
        <Typography variant="h3" className={classes.logotypeText}>
          Digital Securities Depository
        </Typography>
      </div>
      <Paper classes={{ root: classes.paperRoot }}>
        <Typography
          variant="h1"
          color="primary"
          className={classnames(classes.textRow, classes.errorCode)}
        >
          404
        </Typography>
        <Typography variant="h5" color="primary" className={classes.textRow}>
          Oops. Looks like the page you&apos;re looking for no longer exists
        </Typography>
        <Typography variant="h6" className={classnames(classes.textRow, classes.safetyText)}>
          But we&apos;re here to bring you back to safety
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/"
          size="large"
          className={classes.backButton}
        >
          Back to Home
        </Button>
      </Paper>
    </Grid>
  );
}
