Imports System.Web
Imports System.Web.Services
Imports Newtonsoft.Json.Linq
Imports System.Web.Script.Serialization

Public Class cob
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest

        Dim db As New mbpDataContext

        Dim client = context.Request.QueryString("client")
        Dim vend = context.Request.QueryString("vend")
        client = HttpUtility.UrlDecode(client)

        Dim cobQuery =
            From c In db.cobranzas
            Where c.CLIENTE = client And c.SALDO > 0
            Select New With {
                .COBRANZA = c.COBRANZA,
                .CLIENTE = c.CLIENTE,
                .VENTA = c.VENTA,
                .TIPO_DOC = c.TIPO_DOC,
                .NO_REFEREN = c.NO_REFEREN,
                .IMPORTE = c.IMPORTE,
                .SALDO = c.SALDO,
                .FECHA_VENC = c.FECHA_VENC.Value.ToShortDateString}

        context.Response.StatusCode = 200
        Dim json As New JavaScriptSerializer
        context.Response.Write(json.Serialize(cobQuery))


    End Sub

    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

End Class