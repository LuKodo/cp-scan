const nextStep = (signature_method: string) => {
  if (signature_method.toLocaleUpperCase() === 'FIRMA') {
    return "/step-3-signature"
  }

  return "/step-3-picture"
};

export default nextStep;